import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import {
  Chat,
  createOrFindPrivateChatDTO,
} from '../../interfaces/user/chatInterfaces'
import { paginationDTO } from '../../interfaces/user/postInterfaces'
import { ApiError } from '../../lib/ApiErrors'
import { chatParticipantsRepo } from '../../repos/user/chats/chatParticipantsRepo'
import { chatRepo } from '../../repos/user/chats/chatRepo'
import { userRepo } from '../../repos/userRepo'

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

      return { chat: dbCreatedChat, isNew: true }
    }

    return { chat: dbChat }
  },
  getUserChats: async (user: TokenPayload, p: paginationDTO) => {
    console.log('db')
    const { rows: dbChats } = await chatRepo.findByUserId(user.userId, p)
    return { chats: dbChats, pagination: p }
  },
}
