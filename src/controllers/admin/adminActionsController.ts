import type { NextFunction, Request, Response } from "express"
import { adminActionsService } from "../../services/admin/adminActionsService.ts"

export const adminActionsController = {
  requestAdminDeleteUser: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const result = await adminActionsService.requestAdminDeleteUser(
        req.user,
        req.body,
        req.paramsMap.userId
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  adminDeleteUserConfirm: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await adminActionsService.adminDeleteUserConfirm(
        req.queryMap.adminDeleteUserToken
      )
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}