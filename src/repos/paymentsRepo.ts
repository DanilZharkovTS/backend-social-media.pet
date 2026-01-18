import Stripe from 'stripe'
import type {
  paymentCurrency,
  paymentType,
} from '../interfaces/payments/paymentsInterfaces.ts'
import pool from '../pool.ts'

export const paymentsRepo = {
  insertPayment: (
    userId: number,
    type: paymentType,
    amount: number,
    currency: paymentCurrency
  ) => {
    return pool.query(
      `INSERT INTO payments (user_id, type, amount, currency)
          VALUES ($1, $2, $3, $4)
          RETURNING *`,
      [userId, type, amount, currency]
    )
  },
  findPaymentById: (paymentId: number) => {
    return pool.query(
      `SELECT * FROM payments
      WHERE id = $1`,
      [paymentId]
    )
  },
  updatePaymentStripeSessionId: (
    stripeSessionId: string,
    paymentId: number
  ) => {
    return pool.query(
      `UPDATE payments
      SET stripe_session_id = $1
      WHERE id = $2`,
      [stripeSessionId, paymentId]
    )
  },
  updatePaymentToCompleted: (
    stripe_payment_intent_id: string,
    paymentId: number
  ) => {
    return pool.query(
      `UPDATE payments 
      SET status = $1, stripe_payment_intent_id = $2, paid_at = NOW()
      WHERE id = $3
      RETURNING *`,
      ['paid', stripe_payment_intent_id, paymentId]
    )
  },
}
