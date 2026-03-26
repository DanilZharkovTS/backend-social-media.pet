import type { Server, Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'

export const registerChatEvents = (io: Server, socket: Socket) => {
  console.log('chat socket connected')
  socket.on('joinChat', async (data) => {
    try {
      await chatService.joinChatRoom(socket.user, data.chatId)
      socket.join(`chats:${data.chatId}`)
      socket.emit('joinedChat', {chatId: data.chatId})
    } catch (err) {
      socket.emit('error', {message: err.message})
    }
    console.log('Joined chat')
  })
}
