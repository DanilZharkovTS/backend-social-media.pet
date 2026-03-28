import { Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'
import { joinChatRoomDTO } from '../../interfaces/user/chat/chatInterfaces'

export const chatHandler = {
  joinChatRoom: async (socket: Socket, data: any, ctx: joinChatRoomDTO) => {
    try {
      const chatId = ctx.validIds.chatId

      await chatService.joinChatRoom(socket.user, chatId)
      socket.join(`chats:${chatId}`)
      socket.emit('joinedChat', { chatId })
    } catch (err) {
      socket.emit('chat:error', { message: err.message })
    }
  },
  leaveChatRoom: async (socket: Socket, data: any, ctx: joinChatRoomDTO) => {
    const chatId = ctx.validIds.chatId

    socket.leave(`chats:${chatId}`)
  },
}
