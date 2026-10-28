import type { Request, Response, NextFunction } from 'express'
import { BadAction } from '@/infras/errors/bad-action'

/**
 * Boundary Express — bắt exception chưa được controller xử lý, convert sang BadAction JSON.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error(err.message)

  BadAction.fromUnknownError({ cause: err.message }).toResponse(res)
}
