import { Redis } from 'ioredis'

export const getRedis = () => {
  return new Redis({
    port: Number(process.env.REDIS_PORT),
  })
}
