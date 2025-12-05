import type { NextFunction, Request, Response } from 'express'
import { userService } from '../services/userService.ts'

export const userController = {
  //me
  readMyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.readMyInfo(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  updateMyInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateMyInfo(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  updateMyAvatarUrl: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateMyAvatarUrl(req.user, req.body)
      res.status(201).json(result)
    } catch (err) {      
      next(err)
    }
  },
  //users
  readUserInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.readUserInfo(req.paramsMap.userId)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
