import type { NextFunction, Request, Response } from 'express'
import type { ZodSchema } from 'zod'
import { ZodError } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = schema.parse(req.body)
      return next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          error: 'UNPROCESSABLE_ENTITY',
          message: 'Validation error',
          issues: err.issues,
          request_id: req.requestId,
        })
      }
      return next(err)
    }
  }
}

