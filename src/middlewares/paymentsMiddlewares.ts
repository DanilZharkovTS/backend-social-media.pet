import type { NextFunction, Request, Response } from 'express'
import Stripe from 'stripe'
import { ApiError } from '../lib/ApiErrors.ts'

export const paymentsMiddlewares = {
  handleWebhook: (req: Request, res: Response, next: NextFunction) => {
    let event: Stripe.Event
    const sign = req.headers['stripe-signature']

    if (!sign) throw ApiError('Missing Stripe signature', 401)

    try {
      console.log(process.env.STRIPE_WEBHOOK_SIGN);
      console.log(sign);
      
      
      event = Stripe.webhooks.constructEvent(
        req.body,
        sign,
        process.env.STRIPE_WEBHOOK_SIGN
      )

      req.stripeEvent = event
      next()
    } catch (err) {
      throw ApiError('Invalid Stripe signature', 401)
    }
  },
}
