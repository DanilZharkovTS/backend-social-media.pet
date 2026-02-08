import type { SubscriptionPeriod, SubscriptionPlan } from "./subscriptionInterfaces"

export interface Order {
  id: number
  user_id: number
  type: orderType
  amount: number
  currency: orderCurrency
  status: orderStatus
  stripe_session_id: string | null
  stripe_payment_intent_id: string | null
  created_at: Date
  paid_at: Date | null
  stripe_subscription_id: string | null
  subscription_plan: SubscriptionPlan | null
  subscription_period: SubscriptionPeriod | null
  billing_type: orderBillingType | null
}

export type checkoutType = 'ONE_TIME' | 'SUBSCRIPTION'

export type orderBillingType = 'ONE_TIME' | 'SUBSCRIPTION'

export type orderType = 'checkmark'

export type orderStatus = 'pending' | 'paid' | 'unpaid'

export type orderCurrency = 'usd' | 'euro' | 'uah'



export interface checkoutDTO {
  type: checkoutType
  product: orderType
  plan?: SubscriptionPlan
  period?: SubscriptionPeriod
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
