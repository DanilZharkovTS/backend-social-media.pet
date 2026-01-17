import type { NextFunction, Request, Response } from 'express'
import { paymentsServices } from '../services/payment/paymentsService.ts'

export const paymentsController = {
  startCheckout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await paymentsServices.startCheckout(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
}
