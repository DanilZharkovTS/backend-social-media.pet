import type { NextFunction, Request, Response } from 'express'
import { authService } from '../services/auth/authService.ts'

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.register(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.verifyEmail(req.queryMap.emailToken)
      res.status(200).json(result)
    } catch (err) {
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
  loginEmailConfirm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.loginEmailConfirm(req.body)
      res.cookie('trustedDeviceToken', result.trustedDeviceToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
      })
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
  requestChangeEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.requestChangeEmail(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  changeEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.changeEmailConfirm(
        req.queryMap.emailChangeToken
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.forgotPassword(req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  requestPasswordResetEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await authService.requestPasswordResetEmail(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await authService.resetPassword(
        req.queryMap.resetPasswordToken,
        req.body
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
}
