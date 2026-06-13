import crypto from 'crypto'
import {
  actionTokenType,
  SessionType,
  Time,
} from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { urlBuilder } from '../shared/urlBuilder'
import { ApiError } from '../../lib/ApiErrors'
import jwt from 'jsonwebtoken'
import { authHelpers } from '../../utils/helpers/auth/authHelpers'

const actionTokenConfig = {
  ACCOUNT_INVITE: urlBuilder.accountInviteUrl,
}

export const tokenService = {
  generateAccessToken: (
    userId: number,
    email: string,
    role: string,
    sessionId: number,
    sessionType: SessionType
  ) => {
    const accessToken = jwt.sign(
      { userId, email, role, sessionType },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m',
      }
    )
    return accessToken
  },
  generateActionToken: () => {
    const rawActionToken = crypto.randomBytes(64).toString('base64url')
    const hashedActionToken = crypto
      .createHash('sha256')
      .update(rawActionToken)
      .digest('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    return { rawActionToken, hashedActionToken, expiresAt }
  },
  saveActionToken: async (
    userId: number,
    type: actionTokenType,
    payload?: any
  ) => {
    const { rawActionToken, hashedActionToken, expiresAt } =
      tokenService.generateActionToken()

    const handler = actionTokenConfig[type]
    if (!handler) throw ApiError(`Unknown token type: ${type}`, 400)

    const tokenPayload = { ...handler(rawActionToken), ...payload }

    await authRepo.insertActionToken(
      userId,
      hashedActionToken,
      expiresAt,
      type,
      tokenPayload
    )

    return {
      rawActionToken,
      payload: tokenPayload,
    }
  },
  hash: (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex')
  },
    issueTokens: async (
      { id: userId, email, role }: { id: number; email: string; role: string },
      name: string,
      sessionType: SessionType,
      interval: { value: number; unit: Time }
    ) => {
      const { rawRefreshToken, hashedRefreshToken, accessToken, session } =
        await authHelpers.issueSessionTokens(userId, email, role, sessionType, name, interval)
  
      return {
        tokens: { rawRefreshToken, hashedRefreshToken, accessToken },
        sessionId: session.id,
      }
    },
}
