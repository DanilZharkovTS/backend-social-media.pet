import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import {
  addPeepDTO,
  deletePeepDTO,
  editPeepDTO,
  findPeepsDTO,
  Peep,
} from '../../../interfaces/user/chat/chatInterfaces'
import { paginationDTO } from '../../../interfaces/user/postInterfaces'
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
  findPeeps: async (search: string, chatId: number, p: paginationDTO) => {
    const redis = getRedis()
    const redisKey = `chats:${chatId}:peeps${
      search ? `:search:${search}` : null
    }`

    if (p.page === 1) {
      const redisResult = await redis.lrange(redisKey, p.start, p.end)

      if (redisResult.length) {
        const redisPeeps = redisResult.map((p) => JSON.parse(p))
        return { peeps: redisPeeps, pagination: p }
      }
    }

    const { rows: dbPeeps } = await chatPeepsRepo.findByContent(
      search,
      chatId,
      p
    )

    if (p.page === 1 && dbPeeps.length) {
      const items = dbPeeps.map((peep) => JSON.stringify(peep))
      await redis.rpush(redisKey, ...items)
      await redis.ltrim(redisKey, -1000, -1)
    }

    return { peeps: dbPeeps, pagination: p }
  },
  editPeep: async (
    user: TokenPayload,
    { validIds, validData }: editPeepDTO
  ) => {
    const { peepId } = validIds

    const peepResult = await chatPeepsRepo.findById(peepId)
    const dbPeep: Peep = peepResult.rows[0]

    chatPeepService.validateManagingPeep(dbPeep, user.userId, validData.content)

    const editedPeepResult = await chatPeepsRepo.updatePeep(
      validData.content,
      peepId
    )
    const dbEditedPeep: Peep = editedPeepResult.rows[0]

    await cacheService.invalidateByPrefix(`chats:${dbEditedPeep.chat_id}:peeps`)

    return { editedPeep: dbEditedPeep }
  },
  deletePeep: async (user: TokenPayload, { validIds }: deletePeepDTO) => {
    const { peepId } = validIds

    const peepResult = await chatPeepsRepo.findById(peepId)
    const dbPeep: Peep = peepResult.rows[0]

    chatPeepService.validateManagingPeep(dbPeep, user.userId)

    const deletedPeepResult = await chatPeepsRepo.deleteById(peepId)
    const dbDeletedPeep: Peep = deletedPeepResult.rows[0]

    await cacheService.invalidateByPrefix(
      `chats:${dbDeletedPeep.chat_id}:peeps`
    )

    return { deletedPeep: dbDeletedPeep }
  },
  validateManagingPeep: (
    peep: Peep | undefined,
    userId: number,
    newContent?: string
  ) => {
    if (!peep) {
      throw ApiError('Peep not found', 404)
    }

    if (peep.sender_id !== userId) {
      throw ApiError('You are not allowed to manage this peep', 403)
    }

    if (newContent !== undefined && peep.content === newContent) {
      throw ApiError('Content must be different from the current one', 400)
    }
  },
}
