import crypto from 'crypto'
import { actionTokenType } from '../../interfaces/auth/authInterfaces'
import { authRepo } from '../../repos/authRepo'


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
    
    const inviteUrl = `${process.env.FRONTEND_URL}/invite/${userId}?token=${rawActionToken}`

    await authRepo.insertActionToken(userId, hashedActionToken, expiresAt, type, {inviteUrl})


    return {
      rawActionToken,
      hashedActionToken,
      expiresAt,
      type,
      userId,
      inviteUrl
    }
  },
}
