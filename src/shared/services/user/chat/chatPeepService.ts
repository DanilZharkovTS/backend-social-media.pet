import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import {
  addPeepDTO,
  ChatParticipant,
  deletePeepDTO,
  editPeepDTO,
  markPeepsAsReadUpToDTO,
  Peep,
  updateReactionDTO,
} from '../../../interfaces/user/chat/chatInterfaces'
import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
import { getRedis } from '../../../lib/redisClient'
import { chatParticipantsRepo } from '../../../repos/user/chats/chatParticipantsRepo'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'
import { cacheService } from '../../shared/cacheService'

export const chatPeepService = {
  addPeep: async (user: TokenPayload, { validIds, validData }: addPeepDTO) => {
    const redis = getRedis()
    const redisKey = `chats:${validIds.chatId}:peeps`

    const peepResult = await chatPeepsRepo.addPeep(
      user.userId,
      validIds.chatId,
      validData.content
    )

    const dbPeep = peepResult.rows[0]

    const redisResult = await redis.lrange(redisKey, -50, -1)
    const redisPeeps = redisResult.map((p) => JSON.parse(p))

    if (redisPeeps.length) {
      await redis.rpush(redisKey, JSON.stringify(dbPeep))
      await redis.ltrim(redisKey, -1000, -1)
    }

    return { newPeep: { ...dbPeep, status: 'sent' } }
  },

  findPeeps: async (
    user: TokenPayload,
    search: string,
    chatId: number,
    p: paginationDTO
  ) => {
    const redis = getRedis()
    const redisKey = `chats:${chatId}:peeps`

    const opponentResult = await chatParticipantsRepo.findOpponentByChatId(
      chatId,
      user.userId
    )
    const dbOpponent: ChatParticipant = opponentResult.rows[0]

    if (!dbOpponent) {
      throw new Error('Opponent not found')
    }

    const lastRead = dbOpponent.last_read_peep_id ?? 0

    if (!search && p.page === 1) {
      const redisResult = await redis.lrange(redisKey, p.start, p.end)

      if (redisResult.length) {
        const redisPeeps: Peep[] = redisResult.map((p) => JSON.parse(p))
        const peepsWithStatus = redisPeeps.map((p) => ({
          ...p,
          status:
            p.sender_id === user.userId
              ? p.id <= lastRead
                ? 'read'
                : 'sent'
              : undefined,
        }))

        const hasMore = redisPeeps.length === p.limit

        return {
          hasMore,
          peeps: peepsWithStatus,
          pagination: p,
        }
      }
    }

    const { rows: dbPeeps } = await chatPeepsRepo.findByContent(
      search,
      chatId,
      p
    )
    const reversedPeeps: Peep[] = [...dbPeeps].reverse()

    const peepsWithStatus = reversedPeeps.map((p) => ({
      ...p,
      status:
        p.sender_id === user.userId
          ? p.id <= lastRead
            ? 'read'
            : 'sent'
          : null,
    }))

    if (!search && p.page === 1 && reversedPeeps.length) {
      const items = reversedPeeps.map((peep) => JSON.stringify(peep))

      await redis
        .multi()
        .del(redisKey)
        .rpush(redisKey, ...items)
        .ltrim(redisKey, -1000, -1)
        .expire(redisKey, 60 * 10)
        .exec()
    }

    const hasMore = dbPeeps.length === p.limit

    return {
      hasMore,
      peeps: peepsWithStatus,
      pagination: p,
    }
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
  markPeepsAsReadUpTo: async (
    user: TokenPayload,
    { validIds }: markPeepsAsReadUpToDTO
  ) => {
    const { chatId, peepId } = validIds

    const participantResult = await chatParticipantsRepo.findByChatIdAndUserId(
      chatId,
      user.userId
    )
    const dbParticipant = participantResult.rows[0]

    if (!dbParticipant) {
      throw ApiError('You are not in this chat', 403)
    }

    const { last_read_peep_id: lastReadId }: ChatParticipant = dbParticipant
    if (lastReadId && peepId < lastReadId) {
      return
    }

    const updated = await chatParticipantsRepo.updateLastReadPeep(
      peepId,
      user.userId,
      chatId
    )

    if (!updated.rowCount) {
      throw ApiError('Invalid peep', 400)
    }

    return { lastReadPeepId: peepId }
  },
  updateReaction: async (
    { userId }: TokenPayload,
    { validIds, validData }: updateReactionDTO
  ) => {
    const { peepId } = validIds
    const { emoji } = validData

    const dbPeep = await chatPeepsRepo.findByIdAndUserIdWithReactions(
      peepId,
      userId
    )

    if (!dbPeep) {
      throw ApiError('Peep not found', 404)
    }
    if (emoji === dbPeep.emoji) return { updatedReaction: dbPeep }

    if (!dbPeep.reaction_id) {
      return chatPeepsRepo.addReaction(peepId, userId, emoji)
    }

    if (!emoji) {
      await chatPeepsRepo.deleteReactionById(dbPeep.reaction_id)
      return { updatedReaction: { ...dbPeep, emoji: null } }
    }

    return chatPeepsRepo.updateReactionById(dbPeep.reaction_id, emoji)
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
  autoDeletePeeps: async () => {
    const { rows: dbDeletedPeeps } = await chatPeepsRepo.deleteExpiredPeeps()

    if (!dbDeletedPeeps.length) return

    const byChatId: Record<number, number[]> = {}
    for (const row of dbDeletedPeeps) {
      const { chat_id, id } = row
      ;(byChatId[chat_id] ??= []).push(id)
    }

    return { byChatId }
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
