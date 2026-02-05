import { getStripe } from '../../lib/stripeClient.ts'

export const stripeService = {
  createOneTimeCheckoutSession: async (priceId: string, orderId: number) => {
    const stripe = getStripe()

    const sessionResult = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: { orderId },
      success_url: `${process.env.FRONTEND_URL}/checkout/success?type=checkmark`,
      cancel_url: `${process.env.FRONTEND_URL}/profile`,
    })

    return { url: sessionResult.url, sessionId: sessionResult.id }
  },
  createSubscriptionCheckoutSession: async (
    priceId: string,
    orderId: number
  ) => {
    const stripe = getStripe()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: { orderId: String(orderId) },
      success_url: `${process.env.FRONTEND_URL}/checkout/success?type=checkmark`,
      cancel_url: `${process.env.FRONTEND_URL}/profile`,
    })

    return { checkoutUrl: session.url, sessionId: session.id }
  },
}
