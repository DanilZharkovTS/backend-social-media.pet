import type { NextFunction, Request, Response } from 'express'
import multer from 'multer'
import { ZodError } from 'zod'
import { ApiError } from '../../../lib/ApiErrors'

export const ioErrHandler = (err: any) => {
  if (err instanceof ZodError) {
    const zodErr = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return { errors: zodErr, status: 400 }
  }

  if (err?.code) {
    switch (err.code) {
      case '23505':
        return ApiError('Duplicate key value', 409)
      case '23503':
        return ApiError('Referenced entity does not exist', 400)
      case '23502':
        return ApiError('Missing required field', 400)
      case '22P02':
        return ApiError('Invalid input syntax', 400)
    }
  }

  if (err?.status) {
    return err
  }

  if (err instanceof SyntaxError && 'body' in err) {
    return ApiError('Invalid JSON format', 400)
  }

  return ApiError('Internal server error', 500)
}
