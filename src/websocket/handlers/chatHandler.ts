import { Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'

export const chatHandler = {
  joinChatRoom: async (socket: Socket, data: any, ctx: any) => {
    try {
      const chatId = ctx.validIds.chatId

      await chatService.joinChatRoom(socket.user, chatId)
      socket.join(`chats:${chatId}`)
      socket.emit('joinedChat', { chatId })
    } catch (err) {
      socket.emit('chat:error', { message: err.message })
    }
  },
  leaveChatRoom: async (socket: Socket, data: any, ctx: any) => {
    const chatId = ctx.validIds.chatId

    socket.leave(`chats:${chatId}`)
  },
}
