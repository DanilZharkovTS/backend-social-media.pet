import type { NextFunction, Request, Response } from 'express'
import Stripe from 'stripe'
import { ApiError } from '../../lib/ApiErrors.ts'
import { validateCheckoutData } from '../../utils/validators/orderValidator.ts'

export const billingMiddlewares = {
  validateCheckout: (req: Request, res: Response, next: NextFunction) => {
    try {
      const validData = validateCheckoutData.parse(req.body)

      if (validData.type === 'SUBSCRIPTION') {
        if (!validData.plan)
          throw ApiError('Plan is required for subscriptions', 400)
        if (!validData.period)
          throw ApiError('Period is required for subscriptions', 400)
      }

      req.body = validData
      next()
    } catch (err) {
      console.error(err)
      next(err)
    }
  },
  handleWebhook: (req: Request, res: Response, next: NextFunction) => {
    let event: Stripe.Event
    const sign = req.headers['stripe-signature']

    if (!sign) throw ApiError('Missing Stripe signature', 401)

    try {
      console.log(process.env.STRIPE_WEBHOOK_SIGN)
      console.log(sign)

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
