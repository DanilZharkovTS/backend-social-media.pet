import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
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

    return { url: session.url}
  },
}
