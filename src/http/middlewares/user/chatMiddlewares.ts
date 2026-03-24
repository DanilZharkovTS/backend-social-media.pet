import { NextFunction, Request, Response } from 'express'
import { chatValidator } from '../../../utils/validators/chatValidator'
import { ApiError } from '../../../lib/ApiErrors'

export const chatMiddlewares = {
  createOrFindPrivateChat: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const validData = chatValidator.createOrFindPrivateChatBody.parse(
        req.body
      )

      if (req.user.userId === validData.secondUserId) {
        throw ApiError('Cannot create a chat with yourself', 400)
      }

      req.body = validData
      next()
    } catch (err) {
      next(err)
    }
  },
}
