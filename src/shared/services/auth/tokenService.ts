import crypto from 'crypto'
import {
  actionTokenType,
  SessionType,
} from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { urlBuilder } from '../shared/urlBuilder'
import { ApiError } from '../../lib/ApiErrors'
import jwt from 'jsonwebtoken'

const actionTokenConfig = {
  ACCOUNT_INVITE: urlBuilder.accountInviteUrl,
}

export const tokenService = {
  generateAccessToken: (
    userId: number,
    email: string,
    role: string,
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

    await authRepo.insertActionToken(
      userId,
      hashedActionToken,
      expiresAt,
      type,
      { ...handler(rawActionToken), ...payload }
    )

    return {
      rawActionToken,
      payload,
    }
  },
  hash: (token: string) => {
    return crypto.createHash('sha256').update(token).digest('hex')
  },
}
