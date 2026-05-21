import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import {
  Chat,
  ChatParticipant,
  createOrFindPrivateChatDTO,
  setAutoDeletePeepsDTO,
} from '../../../interfaces/user/chat/chatInterfaces'
import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
import { getRedis } from '../../../lib/redisClient'
import { chatParticipantsRepo } from '../../../repos/user/chats/chatParticipantsRepo'
import { chatRepo } from '../../../repos/user/chats/chatRepo'
import { userRepo } from '../../../repos/userRepo'
import { cacheService } from '../../shared/cacheService'

export const chatService = {
  createOrFindPrivateChat: async (
    user: TokenPayload,
    { secondUserId }: createOrFindPrivateChatDTO
  ) => {
    const secondUserResult = await userRepo.findUserById(secondUserId)

    if (secondUserResult.rowCount === 0) {
      throw ApiError('User not found', 404)
    }

    const chatResult = await chatRepo.findByUserIds([user.userId, secondUserId])
    const dbChat: Chat = chatResult.rows[0]

    if (!dbChat) {
      const createdChatResult = await chatRepo.createChat('private')
      const dbCreatedChat: Chat = createdChatResult.rows[0]

      await chatParticipantsRepo.addParticipant(dbCreatedChat.id, user.userId)
      await chatParticipantsRepo.addParticipant(dbCreatedChat.id, secondUserId)

      await cacheService.invalidateByPrefix(`user:${user.userId}:chats:*`)

      return { chat: dbCreatedChat, isNew: true }
    }

    return { chat: dbChat }
  },
  joinChatRoom: async (user: TokenPayload, chatId: number) => {
    const chatParticipantResult =
      await chatParticipantsRepo.findByChatIdAndUserId(chatId, user.userId)
    const dbChatParticipant = chatParticipantResult.rows[0]

    if (!dbChatParticipant) {
      throw ApiError('No access to this chat', 403)
    }
    return
  },
  notifyOnlineUsers: async (user: TokenPayload) => {
    const redis = getRedis()
    const { userId } = user
    const redisKey = `users:${userId}:online`

    await redis.set(redisKey, 1)
    const { rows: ops } = await chatParticipantsRepo.findOpponentsByUserId(
      userId
    )

    const userIds = ops.map((o) => `users:${o.user_id}:online`)
    const statuses = userIds.length ? await redis.mget(...userIds) : []
    const onlineOps = ops.filter((o, i) => statuses[i])

    return { ops, onlineOps, userId }
  },
  notifyOfflineUsers: async (user: TokenPayload) => {
    const redis = getRedis()
    const { userId } = user
    const redisKey = `users:${userId}:online`

    await redis.expire(redisKey, 2)
    const { rows: ops } = await chatParticipantsRepo.findOpponentsByUserId(
      userId
    )

    return { ops, userId }
  },
  getUserChats: async (user: TokenPayload, p: paginationDTO) => {
    const redis = getRedis()
    const redisKey = `users:${user.userId}:chats:page:${p.page}:limit:${p.limit}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      const redisChats = JSON.parse(redisResult)

      return { chats: redisChats, pagination: p }
    }

    const { rows: dbChats } = await chatRepo.findByUserId(user.userId, p)
    await redis.set(redisKey, JSON.stringify(dbChats), 'EX', 60)

    return { chats: dbChats, pagination: p }
  },
  getChat: async (user: TokenPayload, chatId: number) => {
    const redis = getRedis()
    const redisKey = `user:${user.userId}:chats:${chatId}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      const redisChat = JSON.parse(redisResult)

      return { chat: redisChat }
    }
    const participantResult = await chatParticipantsRepo.findByChatIdAndUserId(
      chatId,
      user.userId
    )
    const dbParticipant: ChatParticipant = participantResult.rows[0]

    if (!dbParticipant) {
      throw ApiError('No access to this chat', 403)
    }

    const chatResult = await chatRepo.findByIdAndUserId(chatId, user.userId)
    const dbChat: Chat = chatResult.rows[0]

    await redis.set(redisKey, JSON.stringify(dbChat), 'EX', 60)

    return { chat: dbChat }
  },
  setAutoDeletePeeps: async (
    { userId }: TokenPayload,
    { validData, validIds }: setAutoDeletePeepsDTO
  ) => {
    const redis = getRedis()

    const { chatId } = validIds
    const { interval } = validData

    const redisKey = `user:${userId}:chats:${chatId}`

    const chatResult = await chatRepo.findById(chatId)
    const dbChat: Chat = chatResult.rows[0]

    if (dbChat.auto_delete_after === interval) return

    await chatRepo.updateChatAutoDelete(chatId, interval)
    await cacheService.invalidateByPrefix(redisKey)

    return { chatId, userId, interval }
  },
  deleteChat: async (user: TokenPayload, chatId: number) => {
    const { rows: dbChats } = await chatRepo.findById(chatId)

    if (dbChats.length === 0) {
      throw ApiError('Chat not found', 404)
    }

    const chatParticipantResult =
      await chatParticipantsRepo.findByChatIdAndUserId(chatId, user.userId)
    const dbChatParticipant = chatParticipantResult.rows[0]

    if (!dbChatParticipant) {
      throw ApiError('You are not allowed to delete this chat', 403)
    }

    const { rows: dbDeletedChat } = await chatRepo.deleteById(chatId)

    await cacheService.invalidateByPrefix(`users:${user.userId}:chats:*`)

    return { deletedChat: dbDeletedChat[0] }
  },
}
