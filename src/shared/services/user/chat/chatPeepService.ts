import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import {
  addPeepDTO,
  ChatParticipant,
  deletePeepDTO,
  editPeepDTO,
  markPeepsAsReadUpToDTO,
  Peep,
  PeepWithReaction,
  Reaction,
  ReactionActionType,
  updateReactionDTO,
} from '../../../interfaces/user/chat/chatInterfaces'
import { Notification } from '../../../interfaces/user/notificationInterfaces'
import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
import { getRedis } from '../../../lib/redisClient'
import { chatParticipantsRepo } from '../../../repos/user/chats/chatParticipantsRepo'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'
import { notificationsRepo } from '../../../repos/user/notificationsRepo'
import { cacheService } from '../../shared/cacheService'

export const chatPeepService = {
  addPeep: async (
    { userId }: TokenPayload,
    { validIds: { chatId, replyTo }, validData: { content } }: addPeepDTO
  ) => {
    const redis = getRedis()
    const redisKey = `chats:${chatId}:peeps`

    const peepResult = await chatPeepsRepo.addPeep(
      userId,
      chatId,
      content,
      replyTo
    )
    const dbPeep: PeepWithReaction = peepResult.rows[0]

    const opponentResult = await chatParticipantsRepo.findOpponentByChatId(
      chatId,
      userId
    )
    const dbOpponent = opponentResult.rows[0]

    const notification: Notification = await notificationsRepo.addNotification(
      userId,
      dbOpponent.user_id,
      'peep',
      'peep',
      dbPeep.id
    )

    const redisResult = await redis.lrange(redisKey, -50, -1)
    const redisPeeps = redisResult.map((p) => JSON.parse(p))

    if (redisPeeps.length) {
      await redis.rpush(redisKey, JSON.stringify({ ...dbPeep, reactions: [] }))
      await redis.ltrim(redisKey, -1000, -1)
    }

    return {
      newPeep: { ...dbPeep, reactions: [], status: 'sent' },
      notification,
    }
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

    const peepIds = reversedPeeps.map((p) => p.id)
    const { rows: reactions }: { rows: Reaction[] } =
      await chatPeepsRepo.findReactionsByIds(peepIds)

    const reactionsMap = new Map<number, Reaction[]>()
    for (const r of reactions) {
      if (!reactionsMap.has(r.peep_id)) reactionsMap.set(r.peep_id, [])
      reactionsMap.get(r.peep_id).push(r)
    }

    const peepsWithReactions = reversedPeeps.map((p) => {
      return { ...p, reactions: reactionsMap.get(p.id) ?? [] }
    })

    const peepsWithStatus = peepsWithReactions.map((p) => ({
      ...p,
      status:
        p.sender_id === user.userId
          ? p.id <= lastRead
            ? 'read'
            : 'sent'
          : null,
    }))

    if (!search && p.page === 1 && reversedPeeps.length) {
      const items = peepsWithReactions.map((peep) => JSON.stringify(peep))

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
  updateReaction: async ({ userId }, { validIds, validData }) => {
    const { peepId, chatId } = validIds
    const { emoji } = validData

    const dbPeep: PeepWithReaction =
      await chatPeepsRepo.findByIdAndUserIdWithReactions(peepId, userId)

    if (!dbPeep) throw ApiError('Peep not found', 404)

    const myReaction = dbPeep.reactions.find((r) => r.user_id === userId)
    let reactions = dbPeep.reactions.filter((r) => r.user_id !== userId)

    let type: ReactionActionType
    let newNotification: Notification
    let newNotificationsCount: number

    if (myReaction && myReaction.emoji === emoji) {
      await chatPeepsRepo.deleteReactionByPeepAndUserIds(peepId, userId)
      type = 'deleted'
    } else if (!myReaction || myReaction.emoji !== emoji) {
      const reaction = await chatPeepsRepo.upsertReaction(peepId, userId, emoji)
      reactions = [...reactions, reaction]
      type = myReaction ? 'updated' : 'added'

      if (type === 'added' && dbPeep.sender_id !== userId) {
        newNotification = await notificationsRepo.addNotification(
          userId,
          dbPeep.sender_id,
          'reaction',
          'peep',
          peepId
        )
        newNotificationsCount = await cacheService.updateNotificationsCount(
          dbPeep.sender_id,
          +1
        )
      }
    }

    await cacheService.invalidateByPrefix(`chats:${chatId}:peeps`)

    const notifySender = !!newNotification

    return {
      response: { peepId, reactions, type },
      internal: {
        notifySender,
        notificationCountUpdate: notifySender
          ? {
              userId: dbPeep.sender_id,
              newNotification,
              newNotificationsCount,
            }
          : null,
      },
    }
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
