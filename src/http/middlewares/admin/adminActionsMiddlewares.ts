import type { NextFunction, Request, Response } from 'express'
import crypto from 'crypto'
import {
  validateAdminDeleteUserConfirm,
  validateRequestAdminDeleteUser,
} from '../../../utils/validators/adminActionsValidator.ts'

export const adminActionsMiddlewares = {
  requestAdminDeleteUser: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateRequestAdminDeleteUser.parse(req.body)

      next()
    } catch (err) {
      next(err)
    }
  },
  adminDeleteUserConfirm: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validQuery = validateAdminDeleteUserConfirm.parse(req.query)

      const hashedAdminDeleteUserToken = crypto
        .createHash('sha256')
        .update(validQuery.adminDeleteUserToken)
        .digest('hex')

      req.queryMap = { adminDeleteUserToken: hashedAdminDeleteUserToken }

      next()
    } catch (err) {
      next(err)
    }
  },
}
