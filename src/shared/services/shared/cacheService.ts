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
  updateNotificationsCount: async (userId: number, value: number) => {
    const redis = getRedis()
    const redisKey = `users:${userId}:notifications:count`
    let newCount: number

    newCount = await redis.incrby(redisKey, value)

    if (newCount < 0) {
      await redis.set(redisKey, 0)
      newCount = 0
    }
    return newCount
  },
  resetNotificationsCount: async (userId: number) => {
    const redis = getRedis()
    const redisKey = `users:${userId}:notifications:count`

    await redis.set(redisKey, 0)
    return 0
  },
}
