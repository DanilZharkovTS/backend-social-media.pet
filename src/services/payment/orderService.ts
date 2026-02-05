import Stripe from 'stripe'
import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type { paymentType } from '../../interfaces/payments/paymentsInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { stripeService } from './stripeService.ts'
import { orderRepo } from '../../repos/orderRepo.ts'
import { userRepo } from '../../repos/userRepo.ts'

export const orderService = {
  startCheckout: async (user: TokenPayload) => {
    const userResult = await userRepo.findUserById(user.userId)
    const dbUser = userResult.rows[0]

    if (dbUser.has_checkmark) {
      throw ApiError('Checkmark already active', 409)
    }

    const orderResult = await orderRepo.insertOrder(
      user.userId,
      'checkmark',
      1,
      'usd'
    )
    const dbOrder = orderResult.rows[0]

    const session = await stripeService.createOneTimeCheckoutSession(
      process.env.STRIPE_CHECKMARK_PRICE_ID,
      dbOrder.id
    )

    await orderRepo.updateOrderStripeSessionId(
      session.sessionId,
      dbOrder.id
    )

    return { url: session.url }
  },
  handleWebhook: async (event: Stripe.Event) => {
    console.log('EVENT TYPE:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await orderService.handleCheckoutCompleted(event)
        return { checkmark: true }
    }
  },
  handleCheckoutCompleted: async (event: Stripe.Event) => {
    console.log('HANDLE CHECKOUT COMPLETED START')

    const session = event.data.object as Stripe.Checkout.Session
    if (!session.payment_intent) {
      throw ApiError('Payment intent is missing in checkout session', 400)
    }

    const orderId = Number(session.metadata.orderId)

    const orderResult = await orderRepo.findOrderById(orderId)
    const dbOrder = orderResult.rows[0]

    if (!dbOrder) throw ApiError(`Payment #${orderId} was not found`, 404)

    switch (dbOrder.type as paymentType) {
      case 'checkmark':
        await orderRepo.updateOrderToCompleted(
          String(session.payment_intent),
          orderId
        )

        await userRepo.updateCheckmarkById(true, dbOrder.user_id)
        break
    }
  },
}
