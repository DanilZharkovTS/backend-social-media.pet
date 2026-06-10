import 'express'
import Stripe from 'stripe'
import { AuthProvider, SessionType } from '../auth/authInterfaces'

declare module 'express-serve-static-core' {
  interface Request {
    device?: string
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
      token?: string
      adminDeleteUserToken?: string
      cursor?: number | string | null
    }
    validBody?: any
    user?: {
      userId: number
      email: string
      role: string
      sessionType: SessionType
    }
    stripeEvent?: Stripe.Event
    hashedRefreshToken?: string
    hashedTrustedDeviceToken?: string
    fileValidationError?: null | string
  }
}

export type PaginationType = 'cursor' | 'offset'
