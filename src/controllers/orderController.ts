import type { NextFunction, Request, Response } from 'express'
import { orderService } from '../services/payment/orderService.ts'

export const orderController = {
  startCheckout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await orderService.startCheckout(req.user)
      res.status(200).json(result)
    } catch (err) {
      next(err)
    }
  },
  handleWebhook: async (req: Request, res: Response, next: NextFunction) => {
    try {
          console.log('WEBHOOK CONTROLLER HIT');

      const result = await orderService.handleWebhook(req.stripeEvent)
      res.status(200).json(result)
    } catch (err) {
      console.log(err);
      
      next(err)
    }
  }
}
