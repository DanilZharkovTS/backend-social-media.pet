import { NextFunction, Request, Response } from 'express'
import { chatService } from '../../../services/user/chat/chatService'
import { chatPeepService } from '../../../services/user/chat/chatPeepService'

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
      const result = await chatService.getUserChats(req.user, req.pagination)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
  deleteChat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await chatService.deleteChat(
        req.user,
        req.paramsMap.chatId
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },

  //peeps

  findPeeps: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await chatPeepService.findPeeps(
        req.user,
        req.queryMap.search,
        req.paramsMap.chatId,
        req.pagination
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
}
