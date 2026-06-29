import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import { ApiError } from '../../../lib/ApiErrors'
import { chatParticipantsRepo } from '../../../repos/user/chats/chatParticipantsRepo'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'
import { aiProvider } from './aiProvider'

export const aiChatService = {
  generateQuickReplies: async ({ userId }: TokenPayload, data) => {
    const d = await chatParticipantsRepo.findByChatIdAndUserId(
      data.chatId,
      userId
    )
    const dbChatParticipant = d.rows[0]

    if (!dbChatParticipant) {
      throw ApiError('You do not have access to this chat', 403)
    }

    const peeps = await chatPeepsRepo.findLastPeepsByChatId(data.chatId, 50)
    const lastPeep = peeps[0]

    if (lastPeep.sender_id == userId) return

    return aiProvider.generateReplies(lastPeep.content, 3)
  },
}
