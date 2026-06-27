import { Socket } from 'socket.io'
import { IoNextFn } from '../../../shared/interfaces/global/socket'
import { getRedis } from '../../../shared/lib/redisClient'
import { ApiError } from '../../../shared/lib/ApiErrors'

export const ioRateLimiter = (
  limit: number,
  window: number,
  endpoint: string
) => {
  return async (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    try {
      const redis = getRedis()
      const ip = socket.handshake.address
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
