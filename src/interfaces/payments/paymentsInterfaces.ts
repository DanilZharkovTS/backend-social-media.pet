export type checkoutType = 'ONE_TIME' | 'SUBSCRIPTION'

export type orderType = 'checkmark' 

export interface checkoutDTO {
  type: checkoutType,
  product: orderType,
  plan?: subcriptionPlan,
  period?: subscriptionPeriod
}

export type paymentStatus = 'pending' | 'paid' | 'unpaid'

export type paymentCurrency = 'usd' | 'euro' | 'uah'

export type subcriptionPlan = 'BASIC'

export type subscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface subscription {
  MONTHLY: string
  QUARTERLY: string
  YEARLY: string
}

export interface subscriptions {
  BASIC: subscription
}
