import { Server } from 'socket.io'
import { registerChatEvents } from './events/chatEvents'
import { ioAuthMiddlewares } from './middlewares/authMiddlewares'
import { chatHandler } from './handlers/chatHandler'
import { registerNotificationEvents } from './events/notificationEvents'

export const registerSockets = (io: Server) => {
  io.use(ioAuthMiddlewares.verifyAccessToken)

  io.on('connection', (socket) => {
    socket.join(`user:${socket.user.userId}`)
    socket.on('disconnect', () => {
      chatHandler.notifyOfflineOpponents(socket)
    })
    registerChatEvents(io, socket)
    registerNotificationEvents(socket)
  })
}
