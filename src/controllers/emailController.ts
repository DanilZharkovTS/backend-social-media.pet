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
  requestPasswordResetEmail: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await emailService.requestPasswordResetEmail(req.user)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
}
