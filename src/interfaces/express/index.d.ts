import 'express'
import Stripe from 'stripe'

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      page: number
      offset: number
      limit: number
    }
    paramsMap?: Record<string, number>
    queryMap?: {
      search?: string
      emailToken?: string
      emailChangeToken?: string
      resetPasswordToken?: string
      adminDeleteUserToken?: string
    }
    user?: {
      userId: number
      email: string
      role: string
    }
    stripeEvent?: Stripe.Event
    hashedRefreshToken?: string
    hashedTrustedDeviceToken?: string
    fileValidationError?: null | string
  }
}
