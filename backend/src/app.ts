import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './api/routes/auth'
import userRoutes from './api/routes/userRoutes'
import messageRoutes from './api/routes/messageRoutes'
import webhookRoutes from './api/routes/webhookRoutes'
import { errorHandler } from './middlewares/errorMiddleware'
import { logger } from './utils/logger'
import { supabaseAdmin } from './config/supabase'

dotenv.config()

const defaultOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3001',
  'https://app.emiid.com',
  'https://www.app.emiid.com',
]

export const allowedOrigins = (() => {
  const configuredOrigins = process.env.CORS_ORIGINS || process.env.CORS_ORIGIN || ''
  const origins = configuredOrigins
    ? configuredOrigins.split(',').map((origin) => origin.trim()).filter(Boolean)
    : defaultOrigins

  if (process.env.NODE_ENV === 'production' && origins.includes('*')) {
    throw new Error('Configuration CORS invalide: wildcard interdit en production')
  }

  return origins
})()

export function createApp(): Application {
  const app: Application = express()

  // Rate limiting global - 100 req/15min par IP
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Trop de requêtes, veuillez réessayer plus tard' },
    standardHeaders: true,
    legacyHeaders: false,
  })
  app.use(globalLimiter)

  app.use(helmet())
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      logger.warn(`Origine bloquee par CORS: ${origin}`)
      return callback(new Error('CORS_FORBIDDEN'))
    },
    credentials: true,
  }))
  app.use(express.json({ limit: '100kb' }))

  app.get('/', (_req: Request, res: Response) => {
    res.status(200).json({
      message: "EmiID Backend est opérationnel !",
      status: 'ok',
      port: Number(process.env.PORT || 5000),
    })
  })

  app.get('/health', async (_req: Request, res: Response) => {
    try {
      const start = Date.now()
      const { error, count } = await supabaseAdmin
        .from('countries')
        .select('id', { count: 'exact', head: true })

      if (error) {
        return res.status(503).json({
          status: 'degraded',
          checks: {
            database: {
              status: 'down',
              message: error.message,
            },
          },
        })
      }

      return res.status(200).json({
        status: 'ok',
        uptime_seconds: Math.round(process.uptime()),
        checks: {
          database: {
            status: 'up',
            response_time_ms: Date.now() - start,
            countries_count: count ?? null,
          },
        },
      })
    } catch (error) {
      return res.status(503).json({
        status: 'degraded',
        checks: {
          database: {
            status: 'down',
            message: error instanceof Error ? error.message : 'Erreur inconnue',
          },
        },
      })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/webhooks', webhookRoutes)

  app.use(errorHandler)

  return app
}

export const app = createApp()
