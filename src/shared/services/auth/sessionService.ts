import { th } from 'zod/v4/locales'
import {
  revokeAllSessionsDTO,
  Session,
  TokenPayload,
} from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { userService } from '../user/userService'
import { ApiError } from '../../lib/ApiErrors'
import { getRedis } from '../../lib/redisClient'
import { tokenService } from './tokenService'

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
  revokeSessionByRefresh: async (token: string) => {
    const redis = getRedis()
    console.log(token)

    const hashed = tokenService.hash(token)

    const session = await authRepo.revokeSessionByToken(hashed)

    if (!session) {
      throw ApiError(
        'Active session connected to your token was not found, try reloading the the page',
        404
      )
    }

    const tokens = await authRepo.revokeValidRefreshesBySessionId(session.id)

    const pipeline = redis.pipeline()

    for (const refresh of tokens) {
      pipeline.del(`refresh:${refresh.token}`)
    }

    await pipeline.exec()

    return session
  },
}
