import type { Server, Socket } from 'socket.io'

export const registerChatSocket = (io: Server, socket: Socket) => {
  console.log('chat socket connected')
  
}
