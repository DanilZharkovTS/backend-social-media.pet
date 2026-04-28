import { getRedis } from '../../lib/redisClient'

export const cacheService = {
  invalidateByPrefix: async (prefix: string) => {
    const redis = getRedis()

    const stream = redis.scanStream({
      match: prefix,
      count: 100,
    })
    stream.on('data', async (keys) => {
      if (keys.length) {
        await redis.del(keys)
      }
    })
  },
}
