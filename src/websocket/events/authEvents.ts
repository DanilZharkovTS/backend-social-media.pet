import { Socket } from 'socket.io'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { authHandler } from '../handlers/authHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'

export const registerAuthEvents = (socket: Socket) => {
  socket.on(
    'session:revoke',
    withMiddlewares(
      socket,
      [
        ioAuthMiddlewares.requireSessionType('normal'),
        resolveIds(['sessionId']),
      ],
      authHandler.revokeUserSession
    )
  )

  socket.on(
    'session:revoke_all',
    withMiddlewares(
      socket,
      [
        ioAuthMiddlewares.requireSessionType('normal'),
        ioAuthMiddlewares.validateRefreshToken,
      ],
      authHandler.revokeAllUserSessions
    )
  )
}
