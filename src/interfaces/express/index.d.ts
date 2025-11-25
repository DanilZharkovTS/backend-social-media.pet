import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      page: number
      offset: number
      limit: number
    }
    paramsMap?: Record<string, number>
    querySearch?: {
      search?: string
    }
    user?: {
      userId: number
      email: string
    }
    hashedRefreshToken?: string
  }
}
