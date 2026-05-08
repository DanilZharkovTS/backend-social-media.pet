import { NextFunction, Request, Response } from 'express'
import { notificationService } from '../../../shared/services/user/notificationService'

export const notificationController = {
  getNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await notificationService.getNotifications(
        req.user,
        req.queryMap.cursor
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
}
