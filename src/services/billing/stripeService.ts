import { getStripe } from '../../lib/stripeClient.ts'

export const stripeService = {
  createOneTimeCheckoutSession: async (
    customerId: string,
    priceId: string,
    orderId: number
  ) => {
    const stripe = getStripe()

    const sessionResult = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      customer: customerId,

      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { orderId },
      success_url: `${process.env.FRONTEND_URL}/billing/checkout/success?type=checkmark`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/subscriptions`,
    })

    return { url: sessionResult.url, sessionId: sessionResult.id }
  },
  createSubscriptionCheckoutSession: async (
    customerId: string,
    priceId: string,
    orderId: number
  ) => {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { orderId: String(orderId) },
      success_url: `${process.env.FRONTEND_URL}/billing/checkout/success?type=checkmark`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/subscriptions`,
    })

    return { checkoutUrl: session.url, sessionId: session.id }
  },
  createStripeCustomer: async (name: string, email: string) => {
    const stripe = getStripe()

    const customer = stripe.customers.create({ name, email })

    return customer
  },
}
