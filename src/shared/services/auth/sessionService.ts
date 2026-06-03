import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { userService } from '../user/userService'

export const sessionService = {
  getActiveUserSessions: async ({ userId }: TokenPayload) => {
    await userService.validateUser(userId)

    const sessions = await authRepo.findActiveSessionsByUserId(userId)

    return { sessions }
  },
  revokeSession: async (sessionId: number) => {
    await authRepo.revokeRefreshBySessionId(sessionId)
    await authRepo.revokeSession(sessionId)
    return
  },
}
