import { ApiError } from '../lib/ApiErrors.ts'
import { authRepo } from '../repos/authRepo.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateResetPasswordToken } from '../utils/helpers/auth/resetPasswordToken.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import { getMailer } from '../lib/mailer.ts'

export const emailService = {
  verifyEmail: async (token: string) => {
    const tokenResult = await authRepo.selectActionTokenByToken(token)

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
    await authRepo.revokeActionTokenById(now, dbToken.id)

    await userRepo.updateIsVerified(true, dbToken.user_id)

    return { emailIsVerified: true }
  },
  requestPasswordResetEmail: async (user: TokenPayload) => {
    const mailer = getMailer()

    const userResult = await userRepo.findUserById(user.userId)
    if (userResult.rows.length === 0) throw ApiError('User is not found', 404)

    const dbUser = userResult.rows[0]

    const { rawResetPasswordToken, hashedResetPasswordToken, expiresAt } =
      generateResetPasswordToken()

    await authRepo.insertActionToken(
      dbUser.id,
      hashedResetPasswordToken,
      expiresAt
    )

    const resetPasswordLink = `http://localhost:3000/api/auth/reset-password?resetPasswordtoken=${rawResetPasswordToken}`

    mailer.sendMail({
      from: '"My App" <no-reply@myapp.dev>',
      to: dbUser.email,
      subject: 'Reset password',
      html: `
      <h2> Reset password </h2>
      <p>Click the link below:</p>
      <a href="${resetPasswordLink}">${resetPasswordLink}</a>
    `,
    })

    return { passwordResetIsSent: true }
  },
}