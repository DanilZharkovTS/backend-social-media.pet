import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const errHandler = (
  err: unknown ,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const zodErr = err.issues.map((e) => {
      return {
        field: e.path.join('.'),
        message: e.message
      }
    })
    return res.status(409).json(zodErr)
  }
  return res.status(500).json({error: 'Internal server error'})
}
