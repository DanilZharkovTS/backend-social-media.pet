import { Socket } from 'socket.io'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import { sessionService } from '../../shared/services/auth/sessionService'
import { revokeAllSessionsDTO } from '../../shared/interfaces/auth/authInterfaces'

export const authHandler = {
  revokeUserSession: async (
    socket: Socket,
    data: any,
    ctx: any,
    next: IoNextFn
  ) => {
    try {
      const { validIds } = ctx

      const result = await sessionService.revokeSession(validIds.sessionId)
      const { response } = result

      socket.emit('session:revoked', response)
      socket.to(`user:${response.user_id}`).emit('session:revoked', [response])
      console.log('was revoked')
    } catch (err) {
      next(err)
    }
  },
  revokeAllUserSessions: async (
    socket: Socket,
    data: any,
    ctx: revokeAllSessionsDTO,
    next: IoNextFn
  ) => {
    try {
      const userId = socket.user.userId
      const result = await sessionService.revokeAllSessionsExceptCurrent(
        socket.user,
        ctx
      )

      socket.emit('session:revoked', result.response)
      socket.to(`user:${userId}`).emit('session:revoked', result.response)
    } catch (err) {
      next(err)
    }
  },
}
