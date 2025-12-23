import 'express'

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
      resetPasswordToken?: string
    }
    user?: {
      userId: number
      email: string
      role: string
    }
    hashedRefreshToken?: string
    fileValidationError?: null | string
  }
}
