import type { NextFunction, Request, Response } from 'express'
import { userService } from '../services/userService.ts'

export const userController = {
  readMyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.readMyInfo(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
