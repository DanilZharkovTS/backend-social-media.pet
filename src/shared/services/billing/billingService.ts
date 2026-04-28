import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { checkoutDTO } from '../../interfaces/billing/orderInterfaces'
import Stripe from 'stripe'
import { orderService } from './orderService'
import { subscriptionService } from './subscriptionService'

export const billingService = {
  startCheckout: async (user: TokenPayload, data: checkoutDTO) => {
    switch (data.type) {
      case 'ONE_TIME': {
        const result = await orderService.handleOneTimeCheckout(user, data)
        return result
      }

      case 'SUBSCRIPTION': {
        const result = await orderService.handleSubscriptionCheckout(user, data)
        return result
      }
    }
  },
  handleWebhook: async (event: Stripe.Event) => {
    console.log('EVENT TYPE:', event.type)

    switch (event.type) {
      case 'checkout.session.completed':
        await orderService.handleCheckoutCompleted(event)
        break

      case 'checkout.session.async_payment_failed':

      case 'invoice.payment_succeeded':
        await subscriptionService.handleInvoicePaymentSucceeded(event)
        break

      case 'invoice.payment_failed':
        await subscriptionService.handleInvoicePaymentFailed(event)
        break
    }
  },
}
