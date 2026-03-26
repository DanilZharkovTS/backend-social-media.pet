import { Server } from 'socket.io'
import { registerChatEvents } from './events/chatEvents'
import { ioAuthMiddlewares } from './middlewares/authMiddlewares'

export const registerSockets = (io: Server) => {
  io.use(ioAuthMiddlewares.verifyAccessToken)

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)    
    registerChatEvents(io, socket)
  })
}
