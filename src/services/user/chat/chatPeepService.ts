import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import {
  addPeepDTO,
  editPeepDTO,
  Peep,
} from '../../../interfaces/user/chat/chatInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
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
  editPeep: async (
    user: TokenPayload,
    { validIds, validData }: editPeepDTO
  ) => {
    const { peepId } = validIds

    console.log(peepId)

    const peepResult = await chatPeepsRepo.findById(peepId)
    const dbPeep: Peep = peepResult.rows[0]
    console.log(dbPeep)

    if (!dbPeep) {
      throw ApiError('Peep not found', 404)
    }

    if (dbPeep.sender_id !== user.userId) {
      throw ApiError('You are not allowed to edit this peep', 403)
    }

    if (dbPeep.content === validData.content) {
      throw ApiError('Content must be different from the current one', 400)
    }

    const editedPeepResult = await chatPeepsRepo.updatePeep(
      validData.content,
      peepId
    )
    const dbEditedPeep: Peep = editedPeepResult.rows[0]

    await cacheService.invalidateByPrefix(`chats:${dbPeep.chat_id}:peeps`)

    return { editedPeep: dbEditedPeep }
  },
}
