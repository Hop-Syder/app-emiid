import type { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'

function buildRequestId() {
  try {
    return randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

export function requestContext(req: Request, res: Response, next: NextFunction) {
  const incoming = req.header('x-request-id')
  const requestId = typeof incoming === 'string' && incoming.trim() ? incoming.trim() : buildRequestId()

  req.requestId = requestId
  res.setHeader('x-request-id', requestId)
  next()
}

