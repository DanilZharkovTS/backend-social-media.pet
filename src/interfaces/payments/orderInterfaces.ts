export type checkoutType = 'ONE_TIME' | 'SUBSCRIPTION'

export type orderType = 'checkmark'

export type paymentStatus = 'pending' | 'paid' | 'unpaid'

export type paymentCurrency = 'usd' | 'euro' | 'uah'

export type subscriptionPlan = 'BASIC'

export type subscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface checkoutDTO {
  type: checkoutType
  product: orderType
  plan?: subscriptionPlan
  period?: subscriptionPeriod
}

export interface plan {
  MONTHLY: period
  QUARTERLY: period
  YEARLY: period
}

export interface period {
  priceId: string
}

export interface subscriptions {
  BASIC: plan
}
