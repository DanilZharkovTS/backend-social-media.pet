import { Socket } from 'socket.io'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { authHandler } from '../handlers/authHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'
import { ioRateLimiter } from '../middlewares/helpers/rateLimiter'

export const registerAuthEvents = (socket: Socket) => {
  socket.on(
    'session:revoke',
    withMiddlewares(
      socket,
      [
        ioRateLimiter(10, 60, 'session_revoke'),
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
        ioRateLimiter(3, 60, 'session_revoke_all'),
        ioAuthMiddlewares.requireSessionType('normal'),
        ioAuthMiddlewares.validateRefreshToken,
      ],
      authHandler.revokeAllUserSessions
    )
  )
}
