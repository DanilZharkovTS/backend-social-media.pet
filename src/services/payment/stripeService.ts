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
        'https://glotcms.sgp1.digitaloceanspaces.com/epic/2024/07/360_F_44525362_SdNC1Ldl6vrIur3SkXrYg6Sk1xqCUuAn.jpg',
    })

    return { url: sessionResult.url, sessionId: Number(sessionResult.id) }
  },
}
