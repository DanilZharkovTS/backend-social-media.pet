import type { NextFunction, Request, Response } from 'express'
import type { updatePostDTO } from '../../interfaces/user/postInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import {
  validateAddPost,
  validateFindPost,
  validateUpdatePost,
} from '../../utils/validators/postValidator.ts'
import { buildUpdatePostData } from '../../utils/helpers/builders/buildUpdatePostData.ts'

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

      if (fields.length === 0 || values.length === 0) {
        throw ApiError('There is no data to update', 400)
      }
      req.body = {
        fields: fields,
        values: values,
      }
      next()
    } catch (err) {
      next(err)
    }
  },

  find: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = validateFindPost.parse(req.query)
      const search = validated.search ? `%${validated.search}%` : null

      req.queryMap = { search: search }
      next()
    } catch (err) {
      next(err)
    }
  },
}
