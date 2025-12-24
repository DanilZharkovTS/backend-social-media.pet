import type { NextFunction, Request, Response } from 'express'
import { emailService } from '../services/emailService.ts'

export const emailController = {
  verifyEmail: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.verifyEmail(req.queryMap.emailToken)
      res.status(200).json(result)
    } catch (err) {
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
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await emailService.forgotPassword(req.body)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

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
}
