import 'express'

declare module 'express-serve-static-core' {
  interface Request {
    pagination?: {
      page: number
      offset: number
      limit: number
    }
    paramsId?: {
      id: number
    }
  }
}
