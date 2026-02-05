import type {
  paymentCurrency,
  orderType,
  subscriptionPlan,
  subscriptionPeriod,
} from '../interfaces/payments/orderInterfaces.ts'
import pool from '../pool.ts'

export const orderRepo = {
  insertOrder: (
    userId: number,
    type: orderType,
    amount: number,
    currency: paymentCurrency
  ) => {
    return pool.query(
      `INSERT INTO orders (user_id, type, amount, currency)
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
      [userId, type, amount, currency]
    )
  },
  addSubscriptionOrder: (
    userId: number,
    type: orderType,
    amount: number,
    currency: paymentCurrency,
    plan: subscriptionPlan,
    period: subscriptionPeriod
  ) => {
    return pool.query(
      `INSERT INTO orders (user_id, type, amount, currency, subscription_plan, subscription_period)
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING *`,
      [userId, type, amount, currency, plan, period]
    )
  },
  findOrderById: (orderId: number) => {
    return pool.query(
      `SELECT * FROM orders
      WHERE id = $1`,
      [orderId]
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
  updateOrderToCompleted: (
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
}
