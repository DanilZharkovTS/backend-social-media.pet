import Stripe from 'stripe'
import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type { paymentType } from '../../interfaces/payments/paymentsInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { stripeService } from './stripeService.ts'
import { paymentsRepo } from '../../repos/paymentsRepo.ts'
import { userRepo } from '../../repos/userRepo.ts'

export const paymentsServices = {
  startCheckout: async (user: TokenPayload) => {
    const userResult = await userRepo.findUserById(user.userId)
    const dbUser = userResult.rows[0]

    if (dbUser.hasCheckmark) {
      throw ApiError('Checkmark already active', 409)
    }

    const paymentResult = await paymentsRepo.insertPayment(
      user.userId,
      'checkmark',
      1,
      'usd'
    )
    const dbPayment = paymentResult.rows[0]

    const session = await stripeService.createCheckoutSession(
      process.env.STRIPE_CHECKMARK_PRICE_ID,
      dbPayment.id
    )

    await paymentsRepo.updatePaymentStripeSessionId(
      session.sessionId,
      dbPayment.id
    )

    return { url: session.url }
  },
  handleWebhook: async (event: Stripe.Event) => {
    console.log('EVENT TYPE:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await paymentsServices.handleCheckoutCompleted(event)
        return { checkmark: true }
    }
  },
  handleCheckoutCompleted: async (event: Stripe.Event) => {
    console.log('HANDLE CHECKOUT COMPLETED START')

    const session = event.data.object as Stripe.Checkout.Session
    if (!session.payment_intent) {
      throw ApiError('Payment intent is missing in checkout session', 400)
    }

    const paymentId = Number(session.metadata.paymentId)

    const paymentResult = await paymentsRepo.findPaymentById(paymentId)
    const dbPayment = paymentResult.rows[0]

    if (!dbPayment) throw ApiError(`Payment #${paymentId} was not found`, 404)

    switch (dbPayment.type as paymentType) {
      case 'checkmark':
        await paymentsRepo.updatePaymentToCompleted(
          String(session.payment_intent),
          paymentId
        )

        await userRepo.updateCheckmarkById(true, dbPayment.user_id)
        break
    }
  },
}
