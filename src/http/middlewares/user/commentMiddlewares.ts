import type { NextFunction, Request, Response } from 'express'
import { buildUpdateCommentData } from '../../../utils/helpers/builders/buildUpdateCommentData.ts'
import type { updateCommentMiddlewareDTO } from '../../../interfaces/user/commentInterfaces.ts'
import { ApiError } from '../../../lib/ApiErrors.ts'
import {
  validateAddComment,
  validateUpdateComment,
} from '../../../utils/validators/commentsValidator.ts'

export const commentMiddlewares = {
  add: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateAddComment.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
  update: (req: Request, res: Response, next: NextFunction) => {
    try {
      const fields: string[] = []
      const values: string[] = []

      const validData: updateCommentMiddlewareDTO = validateUpdateComment.parse(
        req.body
      )
      buildUpdateCommentData(validData, fields, values)

      if (fields.length === 0 || values.length === 0) {
        throw ApiError('No data to update provided', 400)
      }

      req.body = { fields: fields, values: values }
      next()
    } catch (err) {
      next(err)
    }
  },
}
