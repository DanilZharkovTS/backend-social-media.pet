import { Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'

export const chatHandler = {
  joinChatRoom: async (socket: Socket, data) => {
    try {
      await chatService.joinChatRoom(socket.user, data.chatId)
      socket.join(`chats:${data.chatId}`)
      socket.emit('joinedChat', { chatId: data.validIds.chatId })
    } catch (err) {
      socket.emit('chat:error', { message: err.message })
    }
    console.log('Joined chat')
  },
}
