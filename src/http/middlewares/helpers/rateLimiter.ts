import type { NextFunction, Request, Response } from 'express'
import { getRedis } from '../../../lib/redisClient'
import { ApiError } from '../../../lib/ApiErrors'

export const rateLimiter = (
  limit: number,
  window: number,
  endpoint: string
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const redis = getRedis()
      const ip = req.ip
      const key = `rate:${endpoint}:${ip}`

      const requests = await redis.incr(key)

      if (requests === 1) {
        await redis.expire(key, window)
      }

      if (requests > limit) {
        throw ApiError('Too many requests', 429)
      }

      next()
    } catch (err) {
      next(err)
    }
  }
}
