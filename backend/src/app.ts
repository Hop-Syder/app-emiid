import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import authRoutes from './api/routes/auth'
import userRoutes from './api/routes/userRoutes'
import messageRoutes from './api/routes/messageRoutes'
import dashboardRoutes from './api/routes/dashboardRoutes'
import publicRoutes from './api/routes/publicRoutes'
import webhookRoutes from './api/routes/webhookRoutes'
import referenceRoutes from './api/routes/referenceRoutes'
import adminRoutes from './api/routes/adminRoutes'
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

  // SÉCURITÉ : le wildcard '*' combiné à credentials:true expose les sessions
  // de tous les utilisateurs à n'importe quel site. Interdit en production —
  // lister explicitement les origines dans CORS_ORIGINS.
  if (process.env.NODE_ENV === 'production' && origins.includes('*')) {
    logger.error("CORS : wildcard '*' ignoré en production. Listez les origines explicites dans CORS_ORIGINS.")
    return origins.filter((origin) => origin !== '*')
  }

  return origins
})()

export function createApp(): Application {
  const app: Application = express()

  // SÉCURITÉ : derrière un proxy (Railway/Vercel), Express doit faire confiance au
  // header X-Forwarded-For pour reconstruire l'IP réelle du client. Sans cela,
  // `req.ip` vaut l'IP du proxy pour TOUS les clients : les rate limiters
  // (PIN, OTP, auth) partagent alors un seul compteur et la protection
  // anti-brute-force devient inopérante. On limite la confiance au nombre de
  // sauts de proxy (1 par défaut) pour empêcher l'usurpation d'IP via un XFF forgé.
  const trustProxyEnv = (process.env.TRUST_PROXY || '').trim()
  const trustProxyHops = Number.parseInt(trustProxyEnv, 10)
  app.set('trust proxy', Number.isFinite(trustProxyHops) && trustProxyHops >= 0 ? trustProxyHops : 1)

  app.use(helmet())
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true)
      }

      logger.warn(`Origine bloquee par CORS: ${origin}`)
      return callback(new Error('CORS_FORBIDDEN'))
    },
    credentials: true,
  }))
  // Limite explicite du corps JSON (valeur par défaut d'Express, fixée ici
  // pour rester robuste face aux changements de version).
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
        // SÉCURITÉ : le détail de l'erreur BDD est loggué côté serveur uniquement,
        // jamais renvoyé au client (risque de divulgation d'information).
        logger.error('Health check database error', error)
        return res.status(503).json({
          status: 'degraded',
          checks: {
            database: {
              status: 'down',
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
      logger.error('Health check failure', error)
      return res.status(503).json({
        status: 'degraded',
        checks: {
          database: {
            status: 'down',
          },
        },
      })
    }
  })

  app.use('/api/auth', authRoutes)
  app.use('/api/users', userRoutes)
  app.use('/api/messages', messageRoutes)
  app.use('/api/dashboard-user', dashboardRoutes)
  app.use('/api/public', publicRoutes)
  app.use('/api/webhooks', webhookRoutes)
  app.use('/api/reference', referenceRoutes)
  app.use('/api/admin', adminRoutes)

  app.use(errorHandler)

  return app
}

export const app = createApp()
