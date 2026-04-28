import Stripe from 'stripe'
import type {
  Subscription,
  SubscriptionStatus,
  SubscriptionType,
} from '../../interfaces/billing/subscriptionInterfaces'
import pool from '../../../pool'

export const subscriptionRepo = {
  findSubscriptionByStripeSubscriptionId: (
    stripeSubcriptionId: string | Stripe.Subscription
  ) => {
    return pool.query(
      `SELECT * FROM subscriptions
      WHERE stripe_subscription_id = $1`,
      [stripeSubcriptionId]
    )
  },
  addSubscription: async (
    userId: number,
    orderId: number,
    stripeSubscriptionId: string | Stripe.Subscription,
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
  updateSubscriptionPeriod: (
    currentPeriodStart: number,
    currentPeriodEnd: number,
    subscriptionId: number
  ) => {
    return pool.query(
      `UPDATE subscriptions
      SET current_period_start = to_timestamp($1), current_period_end = to_timestamp($2), updated_at = NOW()
      WHERE id = $3`,
      [currentPeriodStart, currentPeriodEnd, subscriptionId]
    )
  },
  updateSubscriptionStatus: (
    status: SubscriptionStatus,
    subscriptionId: number
  ) => {
    return pool.query(
      `UPDATE subscriptions
      SET status = $1
      WHERE id = $2
      RETURNING *`,
      [status, subscriptionId]
    )
  },
}
