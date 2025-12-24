import bcrypt from 'bcrypt'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import type {
  forgotPasswordDTO,
  requestChangeEmailDTO,
  resetPasswordDTO,
} from '../interfaces/emailInterfaces.ts'
import { getMailer } from '../lib/mailer.ts'
import { ApiError } from '../lib/ApiErrors.ts'
import { authRepo } from '../repos/authRepo.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateResetPasswordToken } from '../utils/helpers/auth/resetPasswordToken.ts'
import { generateEmailChangeToken } from '../utils/helpers/auth/emailChangeToken.ts'

export const emailService = {
  verifyEmail: async (token: string) => {
    const tokenResult = await authRepo.selectActionTokenByToken(token)

    if (tokenResult.rows.length === 0) {
      throw ApiError('Verification token is not found', 404)
    }

    const dbToken = tokenResult.rows[0]

    const userResult = await userRepo.findUserById(dbToken.user_id)

    if (userResult.rows[0].email_is_verified) {
      return { emailIsVerified: true }
    }

    if (new Date() > dbToken.expires_at) {
      throw ApiError('Verification token is expired', 410)
    }

    await userRepo.updateIsVerified(true, dbToken.user_id)

    await authRepo.revokeActionTokenById(dbToken.id)

    return { emailIsVerified: true }
  },
  requestChangeEmail: async (
    user: TokenPayload,
    data: requestChangeEmailDTO
  ) => {
    const mailer = getMailer()

    const { rawEmailChangeToken, hashedEmailChangeToken, expiresAt } =
      generateEmailChangeToken()

    await authRepo.insertActionToken(
      user.userId,
      hashedEmailChangeToken,
      expiresAt,
      'EMAIL_CHANGE'
    )

    const emailChangeLink = `http://localhost:3000/api/auth/change-email?emailChangeToken=${rawEmailChangeToken}`

    await mailer.sendMail({
      from: '"My App" <no-reply@myapp.dev>',
      to: data.newEmail,
      subject: 'Email change',
      html: `
      <h2>Email change</h2>
      <p>Click the link below:</p>
      <a href="${emailChangeLink}">${emailChangeLink}</a>
    `,
    })

    return { emailChangeLinkWasSent: true }
  },
  forgotPassword: async (data: forgotPasswordDTO) => {
    const mailer = getMailer()
    const message =
      'If an account with this email exists, a reset link has been sent'

    const userResult = await userRepo.findByEmail(data.email)
    const dbUser = userResult.rows[0]

    if (!dbUser || !dbUser.email_is_verified) {
      return {
        message,
      }
    }

    const { rawResetPasswordToken, hashedResetPasswordToken, expiresAt } =
      generateResetPasswordToken()

    await authRepo.insertActionToken(
      dbUser.id,
      hashedResetPasswordToken,
      expiresAt,
      'PASSWORD_RESET'
    )

    const resetPasswordLink = `http://localhost:3000/api/auth/reset-password?resetPasswordToken=${rawResetPasswordToken}`

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

    return { message }
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
      expiresAt,
      'PASSWORD_RESET'
    )

    const resetPasswordLink = `http://localhost:3000/api/auth/reset-password?resetPasswordToken=${rawResetPasswordToken}`

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
  resetPassword: async (token: string, data: resetPasswordDTO) => {
    const saltRounds = 10

    const tokenResult = await authRepo.selectActionTokenByToken(token)
    const dbToken = tokenResult.rows[0]

    if (!dbToken || dbToken.used_at || new Date() > dbToken.expires_at) {
      throw ApiError('Reset password token is invalid or expired', 400)
    }

    const userResult = await userRepo.findUserById(dbToken.user_id)
    const dbUser = userResult.rows[0]

    const isSamePassword = await bcrypt.compare(
      data.newPassword,
      dbUser.password
    )
    if (isSamePassword) {
      throw ApiError(
        'New password must be different from the current password',
        400
      )
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds)

    await userRepo.updateMyPasswordById(dbToken.user_id, hashedPassword)

    await authRepo.revokeActionTokenById(dbToken.id)

    return { passwordIsChanged: true }
  },
}
