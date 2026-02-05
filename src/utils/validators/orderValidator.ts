import z from 'zod'

export const validateCheckoutData = z.object({
  type: z.enum(
    ['ONE_TIME', 'SUBSCRIPTION'],
    'Type must be ONE_TIME or SUBSCRIPTION'
  ),
  product: z.enum(['checkmark'], 'Product must be checkmark'),
  plan: z.enum(['BASIC'], 'Plan must be BASIC').optional(),
  period: z.enum(
    ['MONTHLY', 'QUARTERLY', 'YEARLY'],
    'Period must be MONTHLY or QUARTERLY or YEARLY'
  ).optional(),
})
