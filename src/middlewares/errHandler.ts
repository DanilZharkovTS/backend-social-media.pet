import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'

export const errHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const zodErr = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return res.status(409).json(zodErr)
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: err.message })
  }

  if (err?.code) {
    switch (err.code) {
      case '23505':
        return res.status(409).json({ error: 'Duplicate key value' })
      case '23503':
        return res.status(400).json({ error: 'Referenced entity does not exist' })
      case '23502':
        return res.status(400).json({ error: `Missing required field: ${err.column}` })
      case '22P02':
        return res.status(400).json({ error: 'Invalid input syntax' })
    }
  }

  return res.status(500).json({ error: 'Internal server error' })
}
