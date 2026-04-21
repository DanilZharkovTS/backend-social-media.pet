import { Server } from 'socket.io'
import { registerChatEvents } from './events/chatEvents'
import { ioAuthMiddlewares } from './middlewares/authMiddlewares'
import { chatHandler } from './handlers/chatHandler'

export const registerSockets = (io: Server) => {
  io.use(ioAuthMiddlewares.verifyAccessToken)

  io.on('connection', (socket) => {
    socket.join(`userRooms:${socket.user.userId}`)
    socket.on('disconnect', () => {
      chatHandler.notifyOfflineOpponents(socket)
    })
    registerChatEvents(io, socket)
  })
}
