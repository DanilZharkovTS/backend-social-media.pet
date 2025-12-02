import type { NextFunction, Request, Response } from 'express'

export const requiresRole = (role: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRole = req.user.role
      if (userRole !== role) {
        return res
          .status(403)
          .json({ err: 'You do not have permission to access this resource' })
      }
      next()
    } catch (err) {
      next(err)
    }
  }
}
