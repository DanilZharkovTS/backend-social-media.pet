import type { NextFunction, Request, Response } from 'express'
import { userService } from '../services/userService.ts'

export const userController = {
  //me
  uploadMyAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.uploadMyAvatar(req.user, req.file)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },
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
  updateMyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateMyEmail(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  updateMyPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.updateMyPassword(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  updateMyAvatarUrl: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
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
  //admin
  findAsAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await userService.findAsAdmin(
        req.queryMap.search,
        req.pagination
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
