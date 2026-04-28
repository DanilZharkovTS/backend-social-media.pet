import type {
  SubscriptionPeriod,
  SubscriptionPlan,
} from '../../interfaces/billing/subscriptionInterfaces.ts'
import type {
  orderCurrency,
  orderStatus,
  orderType,
} from '../../interfaces/billing/orderInterfaces.ts'
import Stripe from 'stripe'
import pool from '../../../pool.ts'

export const orderRepo = {
  insertOrder: (
    userId: number,
    type: orderType,
    amount: number,
    currency: orderCurrency
  ) => {
    return pool.query(
      `INSERT INTO orders (user_id, type, amount, currency, billing_type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, type, amount, currency, 'ONE_TIME']
    )
  },
  addSubscriptionOrder: (
    userId: number,
    type: orderType,
    amount: number,
    currency: orderCurrency,
    plan: SubscriptionPlan,
    period: SubscriptionPeriod
  ) => {
    return pool.query(
      `INSERT INTO orders (user_id, type, amount, currency, subscription_plan, subscription_period, billing_type)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [userId, type, amount, currency, plan, period, 'SUBSCRIPTION']
    )
  },
  findOrderById: (orderId: number) => {
    return pool.query(
      `SELECT * FROM orders
      WHERE id = $1`,
      [orderId]
    )
  },
  findOrderByStripeSubscriptionId: (
    stripeSubscriptionId: string | Stripe.Subscription
  ) => {
    return pool.query(
      `SELECT * FROM orders
      WHERE stripe_subscription_id = $1`,
      [stripeSubscriptionId]
    )
  },
  updateOrderStripeSessionId: (stripeSessionId: string, orderId: number) => {
    return pool.query(
      `UPDATE orders
      SET stripe_session_id = $1
      WHERE id = $2`,
      [stripeSessionId, orderId]
    )
  },
  updateOneTimeOrderToCompleted: (
    stripe_payment_intent_id: string,
    orderId: number
  ) => {
    return pool.query(
      `UPDATE orders 
      SET status = $1, stripe_payment_intent_id = $2, paid_at = NOW()
      WHERE id = $3
      RETURNING *`,
      ['paid', stripe_payment_intent_id, orderId]
    )
  },
  updateSubscriptionOrderToCompleted: (
    stripeSubscriptionId: string | Stripe.Subscription,
    orderId: number
  ) => {
    return pool.query(
      `UPDATE orders 
      SET status = $1, paid_at = NOW(), stripe_subscription_id = $2
      WHERE id = $3
      RETURNING *`,
      ['paid', stripeSubscriptionId, orderId]
    )
  },
  updateOrderStatusById: (status: orderStatus, orderId: number) => {
    return pool.query(
      `UPDATE orders
      SET status = $1
      WHERE id = $2
      RETURNING *`,
      status,
      orderId
    )
  },
}
