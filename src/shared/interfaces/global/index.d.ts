import 'express'
import Stripe from 'stripe'
import { AuthProvider } from '../auth/authInterfaces'

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      page?: number
      offset?: number
      limit?: number
      start?: number
      end?: number
      cursor?: number | null
    }
    paramsMap?: Record<string, number> | Record<string, string>
    queryMap?: {
      search?: string
      emailToken?: string
      emailChangeToken?: string
      resetPasswordToken?: string
      adminDeleteUserToken?: string
      cursor?: number | string | null
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

export type PaginationType = 'cursor' | 'offset'