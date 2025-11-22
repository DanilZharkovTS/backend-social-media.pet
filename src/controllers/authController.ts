import type { NextFunction, Request, Response } from 'express'
import { authService } from '../services/authService.ts'

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      next(err)
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(req.body)
      res.cookie('refreshToken', result.refreshToken)
      res.status(200).json(result.logined)
    } catch (err) {
      console.log(err);
      
      next(err)
    }
  },
}
