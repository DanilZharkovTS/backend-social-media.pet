import { Server } from 'socket.io'

export const registerSockets = (io: Server) => {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)
  })
}
