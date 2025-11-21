import type { NextFunction, Request, Response } from 'express'
import { validateRegisterUser } from '../utils/validators/authValidator.ts'

export const authMiddlewares = {
  register: (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = validateRegisterUser.parse(req.body)
      next()
    } catch (err) {
      next(err)
    }
  },
}
