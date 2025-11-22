import type { NextFunction, Request, Response } from 'express'
import { validateLoginUser, validateRegisterUser } from '../utils/validators/authValidator.ts'

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
  }
}
