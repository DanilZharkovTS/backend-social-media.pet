import crypto from 'crypto'
import { actionTokenType } from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'
import { urlBuilder } from '../shared/urlBuilder'
import { ApiError } from '../../lib/ApiErrors'

const actionTokenConfig = {
  ACCOUNT_INVITE: urlBuilder.accountInviteUrl,
}

export const tokenService = {
  generateActionToken: () => {
    const rawActionToken = crypto.randomBytes(64).toString('base64url')
    const hashedActionToken = crypto
      .createHash('sha256')
      .update(rawActionToken)
      .digest('hex')
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    return { rawActionToken, hashedActionToken, expiresAt }
  },
  saveActionToken: async (userId: number, type: actionTokenType) => {
    const { rawActionToken, hashedActionToken, expiresAt } =
      tokenService.generateActionToken()

    const handler = actionTokenConfig[type]
    if (!handler) throw ApiError(`Unknown token type: ${type}`, 400)
    const payload = handler(rawActionToken)

    await authRepo.insertActionToken(
      userId,
      hashedActionToken,
      expiresAt,
      type,
      payload
    )

    return {
      rawActionToken,
      payload,
    }
  },
}
