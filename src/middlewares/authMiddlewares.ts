import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { NextFunction, Request, Response } from 'express'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import { ApiError } from '../lib/ApiErrors.ts'
import {
  validateLoginUser,
  validateRegisterUser,
} from '../utils/validators/authValidator.ts'

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
        console.log(`MIDDLEWARE BEFORE ${trustedDeviceToken}`)
        hashedTrustedDeviceToken = crypto
          .createHash('sha256')
          .update(trustedDeviceToken)
          .digest('hex')
        console.log(`MIDDLEWARE AFTER ${hashedTrustedDeviceToken}`)
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
}
