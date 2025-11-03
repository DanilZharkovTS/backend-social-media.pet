import type { NextFunction, Request, Response } from 'express'
import {
  validateAddComment,
  validateDeleteComment,
} from '../utils/validators/commentsValidator.ts'

export const commentMiddlewares = {
  add: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateAddComment.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateDeleteComment.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
}
