import { getStripe } from '../../lib/stripeClient.ts'

export const stripeService = {
  createCheckoutSession: async (priceId: string, paymentId: number) => {
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
      metadata: { paymentId },
      success_url:
        `${process.env.FRONTEND_URL}/checkout/success?type=checkmark`,
    })

    return { url: sessionResult.url, sessionId: sessionResult.id }
  },
}
