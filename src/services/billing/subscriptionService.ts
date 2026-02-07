import Stripe from 'stripe'
import { orderRepo } from '../../repos/billing/orderRepo'
import { subscriptionRepo } from '../../repos/billing/subscriptionRepo'
import { ApiError } from '../../lib/ApiErrors'
import { Order } from '../../interfaces/billing/orderInterfaces'
import { userService } from '../user/userService'
import { userRepo } from '../../repos/userRepo'

export const subscriptionService = {
  handleInvoicePaymentSucceeded: async (event: Stripe.Event) => {
    console.log('handleInvoicePaymentSucceeded HIT ----')

    const invoice = event.data.object as Stripe.Invoice
    const subscriptionId =
      invoice.lines.data[0].parent.subscription_item_details.subscription
    const subscriptionResult =
      await subscriptionRepo.findSubscriptionByStripeSubscriptionId(
        subscriptionId
      )
    const dbSubscription = subscriptionResult.rows[0]

    if (!dbSubscription) {
      console.log('SUBSCRIPTION CREATION STARTED ---------')

      const orderResult = await orderRepo.findOrderByStripeSubscriptionId(
        subscriptionId
      )
      const dbOrder: Order = orderResult.rows[0]

      if (!dbOrder) {
        throw ApiError(
          'Order connected to provided subscription id was not found',
          404
        )
      }

      await subscriptionRepo.addSubscription(
        dbOrder.user_id,
        dbOrder.id,
        subscriptionId,
        'active',
        dbOrder.type,
        invoice.period_start,
        invoice.period_end
      )
      console.log('SUBSCRIPTION WAS CREATED -------------')

      await userRepo.updateCheckmarkById(true, dbOrder.user_id)
      console.log('CHECKMARK WAS GIVEN -------------------------')

      return
    }
    
  },
}
