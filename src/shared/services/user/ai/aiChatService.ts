import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import { Peep } from '../../../interfaces/user/chat/chatInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
import { getRedis } from '../../../lib/redisClient'
import { chatParticipantsRepo } from '../../../repos/user/chats/chatParticipantsRepo'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'
import { cacheService } from '../../shared/cacheService'
import { aiProvider } from './aiProvider'

export const aiChatService = {
  generateQuickReplies: async ({ userId }: TokenPayload, data) => {
    const redis = getRedis()
    const redisKey = `chats:${data.chatId}:peeps`

    const d = await chatParticipantsRepo.findByChatIdAndUserId(
      data.chatId,
      userId
    )
    const dbChatParticipant = d.rows[0]

    if (!dbChatParticipant) {
      throw ApiError('You do not have access to this chat', 403)
    }

    const redisResult = await redis.lrange(redisKey, 0, 50)

    if (redisResult && redisResult.length) {
      const lastPeeps = redisResult.map((p) => JSON.parse(p))
      const reversedPeeps = [...lastPeeps].reverse()

      const lastOpponentPeeps = []

      for (const p of reversedPeeps) {
        if (p.sender_id !== userId) {
          lastOpponentPeeps.push(p.content)
        } else {
          break
        }
      }

      if (lastOpponentPeeps.length === 0) return

      return aiProvider.generateReplies([...lastOpponentPeeps].reverse(), 3)
    }

    const lastPeeps: Peep[] = await chatPeepsRepo.findLastPeepsByChatId(
      data.chatId,
      50
    )
    const lastOpponentPeeps = []

    for (const p of lastPeeps) {
      if (p.sender_id !== userId) {
        lastOpponentPeeps.push(p.content)
      } else {
        break
      }
    }

    if (lastOpponentPeeps.length === 0) return

    return aiProvider.generateReplies(lastOpponentPeeps, 3)
  },
}
