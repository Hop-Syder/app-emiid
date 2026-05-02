import { NextFunction, Request, Response } from 'express'
import { isApiError } from '../utils/apiError'
import { logger } from '../utils/logger'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const isProduction = process.env.NODE_ENV === 'production'

  if (err instanceof Error && err.message === 'CORS_FORBIDDEN') {
    return res.status(403).json({
      error: 'CORS_FORBIDDEN',
      message: "Origine non autorisee par la configuration CORS.",
      request_id: _req.requestId,
    })
  }

  if (isApiError(err)) {
    return res.status(err.status).json({
      error: err.code,
      message: isProduction && err.status >= 500 ? "Erreur interne du serveur." : err.message,
      details: isProduction ? undefined : err.details,
      request_id: _req.requestId,
    })
  }

  if (err instanceof Error) {
    logger.error('Unhandled error', { message: err.message, stack: err.stack, request_id: _req.requestId })
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: isProduction ? "Erreur interne du serveur." : err.message,
      request_id: _req.requestId,
    })
  }

  logger.error('Unhandled non-error thrown', { err, request_id: _req.requestId })
  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: "Erreur interne du serveur.",
    request_id: _req.requestId,
  })
}
