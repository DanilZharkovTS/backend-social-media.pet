import { NextFunction, Request, Response } from 'express'
import { chatService } from '../../../services/user/chatService'

export const chatController = {
  createOrFindPrivateChat: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await chatService.createOrFindPrivateChat(
        req.user,
        req.body
      )
      res.status(result.isNew ? 201 : 200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
  getUserChats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await chatService.getUserChats(req.user)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
}
