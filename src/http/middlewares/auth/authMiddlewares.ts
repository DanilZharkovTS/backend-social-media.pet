import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import type { TokenPayload } from '../../../shared/interfaces/auth/authInterfaces.ts'
import { ApiError } from '../../../shared/lib/ApiErrors.ts'
import {
  validateChangeEmail,
  validateForgotPassword,
  validateInviteTimeIntervalBody,
  validateLoginEmailConfirm,
  validateLoginUser,
  validatePasswordBody,
  validateRegisterUser,
  validateRequestChangeEmail,
  validateResetPasswordBody,
  validateResetPasswordQuery,
  validateTokenQuery,
  validateVerifyEmail,
} from '../../../shared/utils/validators/authValidator.ts'
import { ALLOWED_AUTH_PROVIDERS } from '../../../shared/cfg/providers.ts'
import { tokenService } from '../../../shared/services/auth/tokenService.ts'

export const authMiddlewares = {
  register: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validateRegisterUser.parse(req.body)

      if (validData.confirmPassword !== validData.password) {
        throw ApiError(
          "Confirmation password isn't the same as password is",
          400
        )
      }

      req.body = validData
      next()
    } catch (err) {
      next(err)
    }
  },
  login: (req: Request, res: Response, next: NextFunction) => {
    try {
      const trustedDeviceToken = req.cookies.trustedDeviceToken

      let hashedTrustedDeviceToken: string

      if (trustedDeviceToken) {
        hashedTrustedDeviceToken = crypto
          .createHash('sha256')
          .update(trustedDeviceToken)
          .digest('hex')
      }

      req.hashedTrustedDeviceToken = hashedTrustedDeviceToken
      req.body = validateLoginUser.parse(req.body)

      next()
    } catch (err) {
      next(err)
    }
  },
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      throw ApiError('Authorization header is missing', 401)
    }

    const accessToken = authHeader.split(' ')[1]

    if (!accessToken) {
      throw ApiError('Access token is missing', 401)
    }

    try {
      const payload = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      ) as TokenPayload
      req.user = payload
      next()
    } catch (err) {
      throw ApiError('Invalid or expired access token', 401)
    }
  },
  refresh: (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        throw ApiError('You are not authorized', 401)
      }
      const hashedRefreshToken = crypto
        .createHash('sha256')
        .update(refreshToken)
        .digest('hex')

      req.hashedRefreshToken = hashedRefreshToken
      next()
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
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
      const data = validateRequestChangeEmail.parse(req.body)

      if (data.newEmail === req.user.email) {
        throw ApiError('New email must be different from current email', 400)
      }

      req.body = data
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
  //oauth
  checkProviderParam: (req: Request, res: Response, next: NextFunction) => {
    try {
      const provider = ALLOWED_AUTH_PROVIDERS.find(
        (p) => p === req.params.provider
      )

      if (!provider) {
        throw ApiError('Provider is not allowed', 400)
      }

      req.paramsMap = { provider }
      next()
    } catch (err) {
      next(err)
    }
  },
  //shared
  validatePassword: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validatePasswordBody.parse(req.body)
      req.validBody = { ...req.validBody, ...validData }
      next()
    } catch (err) {
      next(err)
    }
  },
  validateToken: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validQuery = validateTokenQuery.parse(req.query)
      const hashedToken = tokenService.hash(validQuery.token)
      req.queryMap = { token: hashedToken }
      next()
    } catch (err) {
      next(err)
    }
  },
  validateInviteTimeInterval: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.body.interval) {
        throw ApiError('Time interval is required', 400)
      }

      const validData = (req.validBody = validateInviteTimeIntervalBody.parse(
        req.body.interval
      ))

      req.validBody = {
        ...req.validBody, interval: validData
      }
      next()
    } catch (err) {
      next(err)
    }
  },
}
