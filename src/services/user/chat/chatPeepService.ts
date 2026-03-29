import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import { addPeepDTO } from '../../../interfaces/user/chat/chatInterfaces'
import { getRedis } from '../../../lib/redisClient'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'
import { cacheService } from '../../shared/cacheService'

export const chatPeepService = {
  addPeep: async (user: TokenPayload, { validIds, validData }: addPeepDTO) => {
    const redis = getRedis()
    const redisKey = `chat:${validIds.chatId}:peeps`

    const peepResult = await chatPeepsRepo.addPeep(
      user.userId,
      validIds.chatId,
      validData.content
    )
    const dbPeep = peepResult.rows[0]

    await redis.lpush(redisKey, JSON.stringify(dbPeep))

    return { newPeep: dbPeep }
  },
  
}
