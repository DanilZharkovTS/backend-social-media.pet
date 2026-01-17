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
  updatePaymentStripeSessionId: (
    stripeSessionId: number,
    paymentId: number
  ) => {
    return pool.query(
      `UPDATE payments
      SET stripe_session_id = $1
      WHERE id = $2`,
      [stripeSessionId, paymentId]
    )
  },
}
