import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    userId?: number
    pagination?: {
      page: number
      offset: number
      limit: number
    }
  }
}