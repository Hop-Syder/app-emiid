import type { NextFunction, Request, Response, RequestHandler } from 'express'

export function asyncHandler<TReq extends Request = Request, TRes extends Response = Response>(
  fn: (req: TReq, res: TRes, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(fn(req as TReq, res as TRes, next)).catch(next)
  }
}

