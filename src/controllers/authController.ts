import type { NextFunction, Request, Response } from 'express'
import { authService } from '../services/authService.ts'

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.log(err);
      
      next(err)
    }
  },
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.login(
        req.body,
        req.hashedTrustedDeviceToken
      )
      if (result.refreshToken) {
        res.cookie('refreshToken', result.refreshToken, {
          httpOnly: true,
          sameSite: 'none',
          secure: true,
        })
      }
      res.status(200).json(result.logined)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.refresh(req.hashedRefreshToken)
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.status(200).json(result.logined)
    } catch (err) {
      res.clearCookie('refreshToken')
      next(err)
    }
  },
  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.logout(req.hashedRefreshToken)
      res.clearCookie('refreshToken')
      res.status(200).json(result)
    } catch (err) {
      res.clearCookie('refreshToken')
      next(err)
    }
  },
}
