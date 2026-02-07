import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
} from '../../interfaces/billing/subscriptionInterfaces'
import pool from '../../pool'

export const subscriptionRepo = {
  findSubscriptionByStripeSubscriptionId: (stripeSubcriptionId: string) => {
    return pool.query(
      `SELECT * FROM subscriptions
      WHERE stripe_subscription_id = $1`,
      [stripeSubcriptionId]
    )
  },
  addSubscription: async (
    userId: number,
    orderId: number,
    stripeSubscriptionId: string,
    status: SubscriptionStatus,
    type: SubscriptionType,
    currentPeriodStart: number,
    currentPeriodEnd: number
  ) => {
    return pool.query(
      `INSERT INTO subscriptions (user_id, order_id, stripe_subscription_id, status, type, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5, to_timestamp($6), to_timestamp($7))
      RETURNING *`,
      [
        userId,
        orderId,
        stripeSubscriptionId,
        status,
        type,
        currentPeriodStart,
        currentPeriodEnd,
      ]
    )
  },
}
