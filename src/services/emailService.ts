import { ApiError } from '../lib/ApiErrors.ts'
import { authRepo } from '../repos/authRepo.ts'
import { userRepo } from '../repos/userRepo.ts'

export const emailService = {
  verifyEmail: async (token: string) => {
    const tokenResult = await authRepo.selectEmailVerificationTokenByToken(
      token
    )

    if (tokenResult.rows.length === 0) {
      throw ApiError('Verification token is not valid', 400)
    }

    const dbToken = tokenResult.rows[0]

    const userResult = await userRepo.findUserById(dbToken.user_id)

    if (userResult.rows[0].email_is_verified) {
      return { emailIsVerified: true }
    }

    if (new Date() > dbToken.expires_at) {
      throw ApiError('Verification token is expired', 400)
    }

    const now: Date = new Date()
    await authRepo.revokeEmailVerificationTokenById(now, dbToken.id)

    await userRepo.updateIsVerified(true, dbToken.user_id)

    return { emailIsVerified: true }
  },

}
