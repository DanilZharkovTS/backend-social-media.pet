import type { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import {
  validateLoginUser,
  validateRegisterUser,
} from '../utils/validators/authValidator.ts'

export const authMiddlewares = {
  register: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateRegisterUser.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
  login: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateLoginUser.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
  verifyAccessToken: (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      return res.status(401).json({ err: 'Authorization header is missing' })
    }

    const accessToken = authHeader.split(' ')[1]

    if (!accessToken) {
      return res.status(401).json({ err: 'Access token is missing' })
    }

    try {
      const payload = jwt.verify(
        accessToken,
        process.env.JWT_SECRET
      ) as TokenPayload
      req.user = payload
      next()
    } catch (err) {
      return res.status(401).json({ err: 'Invalid or expired access token' })
    }
  },
  refresh: (req: Request, res: Response, next: NextFunction) => {
    try {
      const refreshToken = req.cookies.refreshToken
      if (!refreshToken) {
        return res.status(401).json({ err: 'You are not authorized' })
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
