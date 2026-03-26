import { Server } from 'socket.io'
import { registerChatSocket } from './handlers/chatSocket'
import { ioAuthMiddlewares } from './middlewares/authMiddlewares'

export const registerSockets = (io: Server) => {
  io.use(ioAuthMiddlewares.verifyAccessToken)

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)
    console.log(socket.user);
    
    registerChatSocket(io, socket)
  })
}
