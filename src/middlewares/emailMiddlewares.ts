import type { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import { ApiError } from '../lib/ApiErrors.ts'
import {
  validateChangeEmail,
  validateForgotPassword,
  validateLoginEmailConfirm,
  validateRequestChangeEmail,
  validateResetPasswordBody,
  validateResetPasswordQuery,
  validateVerifyEmail,
} from '../utils/validators/emailValidator.ts'

export const emailMiddlewares = {
  verifyEmail: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validateVerifyEmail.parse(req.query)

      const hashedEmailToken = crypto
        .createHash('sha256')
        .update(validData.emailToken)
        .digest('hex')

      req.queryMap = { emailToken: hashedEmailToken }
      next()
    } catch (err) {
      next(err)
    }
  },
  forgotPassword: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateForgotPassword.parse(req.body)

      next()
    } catch (err) {
      next(err)
    }
  },
  loginEmailConfirm: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validateLoginEmailConfirm.parse(req.body)

      const hashedToken = crypto
        .createHash('sha256')
        .update(validData.loginEmailConfirmToken)
        .digest('hex')
      const hashedCode = crypto
        .createHash('sha256')
        .update(String(validData.loginEmailConfirmCode))
        .digest('hex')

      req.body = { hashedToken, hashedCode }
      next()
    } catch (err) {
      next(err)
    }
  },
  requestChangeEmail: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateRequestChangeEmail.parse(req.body)

      next()
    } catch (err) {
      next(err)
    }
  },
  changeEmail: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validQuery = validateChangeEmail.parse(req.query)

      const hashedEmailChangeToken = crypto
        .createHash('sha256')
        .update(validQuery.emailChangeToken)
        .digest('hex')

      req.queryMap = { emailChangeToken: hashedEmailChangeToken }

      next()
    } catch (err) {
      next(err)
    }
  },
  resetPassword: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validQuery = validateResetPasswordQuery.parse(req.query)
      const validBody = validateResetPasswordBody.parse(req.body)

      if (validBody.confirmPassword !== validBody.newPassword) {
        throw ApiError("Confirmation password doesn't match new password", 400)
      }

      req.body = validBody

      const hashedResetPasswordToken = crypto
        .createHash('sha256')
        .update(validQuery.resetPasswordToken)
        .digest('hex')

      req.queryMap = { resetPasswordToken: hashedResetPasswordToken }

      next()
    } catch (err) {
      next(err)
    }
  },
}
