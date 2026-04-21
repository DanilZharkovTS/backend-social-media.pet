import { Server } from 'socket.io'
import { registerChatEvents } from './events/chatEvents'
import { ioAuthMiddlewares } from './middlewares/authMiddlewares'

export const registerSockets = (io: Server) => {
  io.use(ioAuthMiddlewares.verifyAccessToken)

  io.on('connection', async (socket) => {
    socket.join(`userRooms:${socket.user.userId}`)
    registerChatEvents(io, socket)
  })
}
