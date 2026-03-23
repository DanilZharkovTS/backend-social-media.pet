import type { NextFunction, Request, Response } from 'express'
import { billingService } from '../../services/billing/billingService.ts'

export const billingController = {
  startCheckout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await billingService.startCheckout(req.user, req.body)
      res.status(200).json(result)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
  handleWebhook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      console.log('WEBHOOK CONTROLLER HIT')

      await billingService.handleWebhook(req.stripeEvent)
      res.sendStatus(200)
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
}
