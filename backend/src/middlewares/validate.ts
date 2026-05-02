import type { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/apiError'

type Parser<T> = (body: unknown) => T

export function validateBody<T>(parse: Parser<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = parse(req.body)
      return next()
    } catch (err) {
      if (err instanceof ApiError) return next(err)
      return next(new ApiError(422, 'UNPROCESSABLE_ENTITY', 'Validation error'))
    }
  }
}
