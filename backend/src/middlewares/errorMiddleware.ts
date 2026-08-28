import { NextFunction, Request, Response } from 'express'
import { logger } from '../utils/logger'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error && err.message === 'CORS_FORBIDDEN') {
    return res.status(403).json({
      error: 'CORS_FORBIDDEN',
      message: "Origine non autorisee par la configuration CORS.",
    })
  }

  // SÉCURITÉ : ne jamais exposer le détail interne (err.message) au client en
  // production — risque de divulgation d'information. On loggue le détail côté
  // serveur et on renvoie un message générique.
  const isProduction = process.env.NODE_ENV === 'production'
  logger.error('Unhandled error', err)

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: isProduction || !(err instanceof Error)
      ? "Erreur interne du serveur."
      : err.message,
  })
}
