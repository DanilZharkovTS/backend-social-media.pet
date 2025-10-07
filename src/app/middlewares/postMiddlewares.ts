import type { NextFunction, Request, Response } from 'express'
import { validateAddPost } from '../utils/validators/postValidator.ts'

export const postMiddlewares = {
  add: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateAddPost.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
}
