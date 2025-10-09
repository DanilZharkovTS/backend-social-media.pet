import type { NextFunction, Request, Response } from 'express'
import {
  validateAddPost,
  validateDeletePost,
  validateUpdatePost,
} from '../utils/validators/postValidator.ts'
import { buildUpdatePostData } from '../utils/helpers/buildUpdatePostData.ts'
import type { updatePostDTO } from '../interfaces/postInterfaces.ts'

export const postMiddlewares = {
  add: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateAddPost.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      const fields: string[] = []
      const values: string[] = []

      const data: updatePostDTO = validateUpdatePost.parse(req.body)
      buildUpdatePostData(data, fields, values)
      req.body = {
        fields: fields,
        values: values,
      }
      next()
    } catch (err) {
      next(err)
    }
  },
  delete: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateDeletePost.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
}
