import type { Request, Response } from 'express'

export function notFoundHandler(req: Request, res: Response) {
  return res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Route introuvable',
    path: req.originalUrl,
    request_id: req.requestId,
  })
}

