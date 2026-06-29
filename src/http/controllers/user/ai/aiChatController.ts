import { NextFunction, Request, Response } from 'express'
import { aiChatService } from '../../../../shared/services/user/ai/aiChatService'

export const aiChatController = {
  getAiQuickReplies: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await aiChatService.generateQuickReplies(
        req.user,
        req.body
      )
      if (result) {
        return res.status(200).json(result)
      }
      res.sendStatus(200)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
}
