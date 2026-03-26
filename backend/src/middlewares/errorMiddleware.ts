import { NextFunction, Request, Response } from 'express'

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof Error && err.message === 'Non autorise par CORS') {
    return res.status(403).json({
      error: 'CORS_FORBIDDEN',
      message: "Origine non autorisee par la configuration CORS.",
    })
  }

  if (err instanceof Error) {
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message,
    })
  }

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: "Erreur interne du serveur.",
  })
}
