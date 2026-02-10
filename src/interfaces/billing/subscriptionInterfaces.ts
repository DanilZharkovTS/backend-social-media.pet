export type SubscriptionStatus =
  | 'active'
  | 'trialing'
  | 'past_due'
  | 'canceled'
  | 'incomplete'

export type SubscriptionType = 'checkmark'

export type SubscriptionPlan = 'BASIC'

export type SubscriptionPeriod = 'MONTHLY' | 'QUARTERLY' | 'YEARLY'

export interface Subscription {
  id: number
  user_id: number
  order_id: number
  stripe_subscription_id: string
  status: SubscriptionStatus
  type: SubscriptionType
  plan: SubscriptionPlan
  period: SubscriptionPeriod
  current_period_start: Date
  current_period_end: Date
  cancel_at_period_end: boolean
  canceled_at: Date | null
  created_at: Date
  updated_at: Date | null
}
