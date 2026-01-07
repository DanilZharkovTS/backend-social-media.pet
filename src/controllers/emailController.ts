import type { NextFunction, Request, Response } from 'express'
import { emailService } from '../services/email/emailService.ts'

export const emailController = {
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.verifyEmail(req.queryMap.emailToken)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  loginEmailConfirm: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await emailService.loginEmailConfirm(req.body)
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
  requestChangeEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await emailService.requestChangeEmail(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  changeEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.changeEmail(
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
      const result = await emailService.forgotPassword(req.body)
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
      const result = await emailService.requestPasswordResetEmail(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.resetPassword(
        req.queryMap.resetPasswordToken,
        req.body
      )
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  sendAdminDeleteUserEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await emailService.sendAdminDeleteUserEmail(
        req.user,
        req.body,
        req.paramsMap.userId
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  adminDeleteUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.adminDeleteUser(
        req.queryMap.adminDeleteUserToken
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
