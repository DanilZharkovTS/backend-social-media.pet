import { Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'

export const chatHandler = {
  joinChatRoom: async (socket: Socket, data: any) => {
    try {
      const chatId = data.validIds.chatId
      
      await chatService.joinChatRoom(socket.user, chatId)
      socket.join(`chats:${chatId}`)
      socket.emit('joinedChat', { chatId })
    } catch (err) {
      socket.emit('chat:error', { message: err.message })
    }
    console.log('Joined chat')
  },
  leaveChatRoom: async (socket: Socket, data: any) => {
          const chatId = data.validIds.chatId

    socket.leave(`chats:${chatId}`)
  },
}
