import type { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import { ApiError } from '../lib/ApiErrors.ts'

export const emailMiddlewares = { 
  verifyEmail: (req: Request, res: Response, next: NextFunction) => {
    try {
      const emailToken = req.query.emailToken

      if (!emailToken) {
        throw ApiError('Token is missing', 400)
      }

      if (typeof emailToken !== 'string') {
        throw ApiError('Token needs to be a string', 400)
      }

      const hashedEmailToken = crypto
        .createHash('sha256')
        .update(emailToken)
        .digest('hex')

      req.queryMap = { emailToken: hashedEmailToken }
      next()
    } catch (err) {
      next(err)
    }
  },
}