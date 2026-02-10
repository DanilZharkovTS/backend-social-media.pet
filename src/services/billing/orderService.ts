import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  checkoutDTO,
  Order,
} from '../../interfaces/billing/orderInterfaces.ts'
import Stripe from 'stripe'
import { ApiError } from '../../lib/ApiErrors.ts'
import { subscriptionPrices } from '../../cfg/stripePrices.ts'
import { stripeService } from './stripeService.ts'
import { subscriptionService } from './subscriptionService.ts'
import { orderRepo } from '../../repos/billing/orderRepo.ts'
import { userRepo } from '../../repos/userRepo.ts'
import { User } from '../../interfaces/user/userInterfaces.ts'

export const orderService = {
  handleOneTimeCheckout: async (user: TokenPayload, data: checkoutDTO) => {
    let dbUser: User

    const userResult = await userRepo.findUserById(user.userId)
    dbUser = userResult.rows[0]

    if (!dbUser) {
      throw ApiError('User was not found', 404)
    }

    if (!dbUser.stripe_customer_id) {
      const customer = await stripeService.createStripeCustomer(
        dbUser.name,
        dbUser.email
      )
      const updatedUserResult = await userRepo.updateStripeCustomerIdById(
        customer.id,
        dbUser.id
      )
      dbUser = updatedUserResult.rows[0]
    }

    switch (data.product) {
      case 'checkmark': {
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
          dbUser.stripe_customer_id,
          process.env.STRIPE_CHECKMARK_PRICE_ID,
          dbOrder.id
        )

        await orderRepo.updateOrderStripeSessionId(
          session.sessionId,
          dbOrder.id
        )

        return { checkoutUrl: session.url }
      }
    }
  },

  handleSubscriptionCheckout: async (user: TokenPayload, data: checkoutDTO) => {
    let dbUser: User

    const userResult = await userRepo.findUserById(user.userId)
    dbUser = userResult.rows[0]

    if (!dbUser) {
      throw ApiError('User was not found', 404)
    }

    if (!dbUser.stripe_customer_id) {
      const customer = await stripeService.createStripeCustomer(
        dbUser.name,
        dbUser.email
      )
      const updatedUserResult = await userRepo.updateStripeCustomerIdById(
        customer.id,
        dbUser.id
      )
      dbUser = updatedUserResult.rows[0]
    }

    switch (data.product) {
      case 'checkmark': {
        if (dbUser.has_checkmark) {
          throw ApiError('Checkmark already active', 409)
        }

        const validPlan = subscriptionPrices[data.plan]
        if (!validPlan) {
          throw ApiError(`Plan "${data.plan}" is not available`, 400)
        }

        const validPeriod = validPlan[data.period]
        if (!validPeriod) {
          throw ApiError(
            `Period "${data.period}" is not available for plan "${data.plan}"`,
            400
          )
        }

        const orderResult = await orderRepo.addSubscriptionOrder(
          user.userId,
          'checkmark',
          1,
          'usd',
          data.plan,
          data.period
        )
        const dbOrder = orderResult.rows[0]

        const { checkoutUrl, sessionId } =
          await stripeService.createSubscriptionCheckoutSession(
            dbUser.stripe_customer_id,
            validPeriod.priceId,
            dbOrder.id
          )

        await orderRepo.updateOrderStripeSessionId(sessionId, dbOrder.id)

        return { checkoutUrl }
      }
    }
  },

  handleCheckoutCompleted: async (event: Stripe.Event) => {
    console.log('HANDLE CHECKOUT COMPLETED START')

    const session = event.data.object as Stripe.Checkout.Session

    const orderId = Number(session.metadata.orderId)

    const orderResult = await orderRepo.findOrderById(orderId)
    const dbOrder = orderResult.rows[0]

    if (!dbOrder) throw ApiError(`Payment #${orderId} was not found`, 404)

    switch (dbOrder.billing_type) {
      case 'ONE_TIME':
        await orderService.processOneTimeOrder(dbOrder, session)
        break

      case 'SUBSCRIPTION':
        await orderService.processSubscriptionOrder(dbOrder, session)
        break
    }
  },
  processOneTimeOrder: async (
    order: Order,
    session: Stripe.Checkout.Session
  ) => {
    if (!session.payment_intent) {
      console.error('Payment intend is missing')
      throw ApiError('Payment intend is missing', 400)
    }

    switch (order.type) {
      case 'checkmark': {
        await orderRepo.updateOneTimeOrderToCompleted(
          String(session.payment_intent),
          order.id
        )

        await userRepo.updateCheckmarkById(true, order.user_id)
        return
      }
    }
  },
  processSubscriptionOrder: async (
    order: Order,
    session: Stripe.Checkout.Session
  ) => {
    switch (order.type) {
      case 'checkmark':
        await orderRepo.updateSubscriptionOrderToCompleted(
          session.subscription,
          order.id
        )

        break
    }
  },
  handleCheckoutFailed: async (event: Stripe.Event) => {
    console.log('handleCheckoutFailed HIT ------------------')

    const session = event.data.object as Stripe.Checkout.Session
    const orderId = Number(session.metadata.orderId)

    if (!orderId) return

    await orderRepo.updateOrderStatusById('unpaid', orderId)
    console.log(
      'ORDER UNPAID STATUS WAS UPDATED ----------------------------------------'
    )
  },
}
