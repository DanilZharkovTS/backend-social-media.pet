import { Server } from 'socket.io'
import { registerChatSocket } from './handlers/chatSocket'

export const registerSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)
    registerChatSocket(io, socket)
  })
}
