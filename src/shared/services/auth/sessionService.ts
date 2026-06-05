import { th } from 'zod/v4/locales'
import {
  revokeAllSessionsDTO,
  Session,
  TokenPayload,
} from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { userService } from '../user/userService'
import { ApiError } from '../../lib/ApiErrors'
import { cacheService } from '../shared/cacheService'
import { getRedis } from '../../lib/redisClient'

export const sessionService = {
  getActiveUserSessions: async ({ userId }: TokenPayload) => {
    await userService.validateUser(userId)

    const sessions = await authRepo.findActiveSessionsByUserId(userId)

    return { sessions }
  },
  revokeSession: async (sessionId: number) => {
    const redis = getRedis()

    const session: Session = await authRepo.revokeSession(sessionId)

    if (!session) {
      throw ApiError('Active session was not found', 404)
    }

    const refreshTokens = await authRepo.revokeValidRefreshBySessionId(
      sessionId
    )
    const pipeline = redis.pipeline()

    for (const refresh of refreshTokens) {
      pipeline.del(`refresh:${refresh.token}`)
    }

    await pipeline.exec()

    return { response: session }
  },

  revokeAllSessionsExceptCurrent: async (
    { userId }: TokenPayload,
    { validData: { token: hashedToken } }: revokeAllSessionsDTO
  ) => {
    const redis = getRedis()

    const tokenResult = await authRepo.selectRefreshWithUserAndSessionByToken(
      hashedToken
    )
    const token = tokenResult.rows[0]

    const sessions = await authRepo.revokeSessionsByUserIdExcept(
      userId,
      token.session_id
    )
    const sessionIds = sessions.map((s) => s.id)

    const refreshTokens = await authRepo.revokeValidRefreshesByUserIdExcept(
      userId,
      token.session_id
    )
    const pipeline = redis.pipeline()

    for (const refresh of refreshTokens) {
      pipeline.del(`refresh:${refresh.token}`)
    }

    await pipeline.exec()

    return { response: sessionIds }
  },
}
