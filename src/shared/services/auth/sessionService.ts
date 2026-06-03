import { th } from 'zod/v4/locales'
import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { userService } from '../user/userService'
import { ApiError } from '../../lib/ApiErrors'

export const sessionService = {
  getActiveUserSessions: async ({ userId }: TokenPayload) => {
    await userService.validateUser(userId)

    const sessions = await authRepo.findActiveSessionsByUserId(userId)

    return { sessions }
  },
  revokeSession: async (sessionId: number) => {
    const session = await authRepo.revokeSession(sessionId)

    if (!session) {
      throw ApiError('Active session was not found', 404)
    }

    await authRepo.revokeValidRefreshBySessionId(sessionId)

    return { response: session }
  },
}
