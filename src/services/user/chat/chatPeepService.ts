import { TokenPayload } from '../../../interfaces/auth/authInterfaces'
import { addPeepDTO } from '../../../interfaces/user/chat/chatInterfaces'
import { chatPeepsRepo } from '../../../repos/user/chats/chatPeepsRepo'

export const chatPeepService = {
  addPeep: async (user: TokenPayload, { validIds, validData }: addPeepDTO) => {
    const peepResult = await chatPeepsRepo.addPeep(
      user.userId,
      validIds.chatId,
      validData.content
    )
    const dbPeep = peepResult.rows[0]

    return { newPeep: dbPeep }
  },
}
