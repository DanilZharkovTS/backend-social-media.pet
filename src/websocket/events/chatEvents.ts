import type { Server, Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'
import { chatHandler } from '../handlers/chatHandler'

export const registerChatEvents = (io: Server, socket: Socket) => {
  console.log('chat socket connected')
  socket.on('joinChat', (data) => {
    chatHandler.joinChatRoom(socket, data)
  })
}
