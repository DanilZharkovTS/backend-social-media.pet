import bcrypt from 'bcrypt'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import type {
  forgotPasswordDTO,
  loginEmailConfirmDTO,
  requestChangeEmailDTO,
  resetPasswordDTO,
} from '../interfaces/emailInterfaces.ts'
import { getMailer } from '../lib/mailer.ts'
import { ApiError } from '../lib/ApiErrors.ts'
import { authRepo } from '../repos/authRepo.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateResetPasswordToken } from '../utils/helpers/auth/resetPasswordToken.ts'
import { generateEmailChangeToken } from '../utils/helpers/auth/emailChangeToken.ts'
import { generateRefreshToken } from '../utils/helpers/auth/refreshToken.ts'
import { generateAccessToken } from '../utils/helpers/auth/accessToken.ts'
import { generateTrustedDeviceToken } from '../utils/helpers/auth/trustedDeviceToken.ts'

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
  loginEmailConfirm: async (data: loginEmailConfirmDTO) => {
    const tokenResult = await authRepo.selectActionTokenByToken(
      data.hashedToken
    )
    const dbToken = tokenResult.rows[0]

    if (!dbToken || new Date() > dbToken.expires_at || dbToken.used_at) {
      throw ApiError(
        'Login email confirmation token is invalid or expired',
        400
      )
    }

    if (data.hashedCode !== dbToken.payload.code) {
      throw ApiError('Invalid code', 400)
    }

    const userResult = await userRepo.findUserById(dbToken.user_id)
    const dbUser = userResult.rows[0]

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()
    console.log(rawRefreshToken);
    

    const refreshResult = await authRepo.insertRefreshToken(
      dbUser.id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = generateAccessToken(
      dbUser.id,
      dbUser.email,
      dbUser.role
    )

    await authRepo.revokeActionTokenById(dbToken.id)

    const {
      rawTrustedDeviceToken,
      hashedTrustedDeviceToken,
      trustedDeviceExpiresAt,
    } = generateTrustedDeviceToken()

    const trustedDeviceResult = await authRepo.insertTrustedDevice(
      dbUser.id,
      hashedTrustedDeviceToken,
      trustedDeviceExpiresAt
    )

    return {
      trustedDeviceToken: rawTrustedDeviceToken,
      refreshToken: rawRefreshToken,
      logined: { accessToken, user: dbUser },
    }
  },
  requestChangeEmail: async (
    user: TokenPayload,
    data: requestChangeEmailDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    const existingUserResult = await userRepo.findByEmail(data.newEmail)
    const dbExistingUser = existingUserResult.rows[0]

    if (dbExistingUser && dbExistingUser.email_is_verified) {
      throw ApiError('This email is already being used', 409)
    }


    const { rawEmailChangeToken, hashedEmailChangeToken, expiresAt } =
      generateEmailChangeToken()

    await authRepo.insertEmailChangeToken(
      user.userId,
      hashedEmailChangeToken,
      expiresAt,
      data.newEmail,
      'EMAIL_CHANGE'
    )

    const emailChangeLink = `http://localhost:3000/api/auth/change-email?emailChangeToken=${rawEmailChangeToken}`

    if (isProd) {
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
    } else {
      console.log(`
        📧 EMAIL CHANGE (DEV MODE)
        ────────────────────────────
        To: ${data.newEmail}

        Confirmation link:
        👉 ${emailChangeLink}
        ────────────────────────────
        `)
    }

    return { emailChangeLinkWasSent: true }
  },
  changeEmail: async (token: string) => {
    const tokenResult = await authRepo.selectActionTokenByToken(token)
    const dbToken = tokenResult.rows[0]

    if (!dbToken || new Date() > dbToken.expires_at || dbToken.used_at) {
      throw ApiError('Email change token is invalid or expired', 400)
    }

    await userRepo.updateMyEmailById(dbToken.user_id, dbToken.payload.newEmail)

    await authRepo.revokeActionTokenById(dbToken.id)

    return { emailIsChanged: true }
  },
  forgotPassword: async (data: forgotPasswordDTO) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'
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

    const resetPasswordLink = `http://localhost:3001/auth/reset-password?resetPasswordToken=${rawResetPasswordToken}`

    if (isProd) {
      await mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: dbUser.email,
        subject: 'Reset password',
        html: `
        <h2> Reset password </h2>
        <p>Click the link below:</p>
        <a href="${resetPasswordLink}">${resetPasswordLink}</a>
      `,
      })
    } else {
      console.log(`
        📧 RESET PASSWORD (DEV MODE)
        ────────────────────────────
        To: ${dbUser.email}

        Reset password link:
        👉 ${resetPasswordLink}
        ────────────────────────────
        `)
    }

    return { message }
  },
  requestPasswordResetEmail: async (user: TokenPayload) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

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

    const resetPasswordLink = `http://localhost:3001/auth/reset-password?resetPasswordToken=${rawResetPasswordToken}`

    if (isProd) {
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
    } else {
      console.log(`
        📧 EMAIL (DEV MODE)
        ────────────────────────────────
        To: ${dbUser.email}
        Subject: Reset your password

        Reset password link:
        👉 ${resetPasswordLink}

        (Email was NOT sent. Dev mode)
        ────────────────────────────────
          `)
    }

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
