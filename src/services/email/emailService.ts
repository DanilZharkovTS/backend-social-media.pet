import bcrypt from 'bcrypt'
import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  adminDeleteUserTokenDTO,
  changeEmailTokenDTO,
  loginEmailConfirmTokenDTO,
  resetPasswordTokenDTO,
  verifyEmailTokenDTO,
} from '../../interfaces/email/emailInterfaces.ts'
import { getMailer } from '../../lib/mailer.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { authRepo } from '../../repos/authRepo.ts'
import { userRepo } from '../../repos/userRepo.ts'
import { generateResetPasswordToken } from '../../utils/helpers/auth/resetPasswordToken.ts'
import { generateEmailChangeToken } from '../../utils/helpers/auth/emailChangeToken.ts'
import { generateRefreshToken } from '../../utils/helpers/auth/refreshToken.ts'
import { generateAccessToken } from '../../utils/helpers/auth/accessToken.ts'
import { generateTrustedDeviceToken } from '../../utils/helpers/auth/trustedDeviceToken.ts'
import { generateAdminDeleteUserToken } from '../../utils/helpers/auth/adminDeleteUserToken.ts'

export const emailService = {
  sendVerificationEmail: async (
    email: string,
    tokenData: verifyEmailTokenDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?emailToken=${tokenData.rawEmailVerificationToken}`
    if (isProd) {
      await mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: email,
        subject: 'Verify your email',
        html: `
        <h2>Email verification</h2>
        <p>Click the link below:</p>
        <a href="${verificationLink}">${verificationLink}</a>
      `,
      })
    } else {
      console.log(`
      📧 EMAIL (DEV MODE)
      ────────────────────────
      To: ${email}
      Type: Email verification
      Link:
      ${verificationLink}
      ────────────────────────
      `)
    }
  },
  sendLoginEmailConfirmCode: async (
    email: string,
    tokenData: loginEmailConfirmTokenDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    if (isProd) {
      mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: email,
        subject: 'Confirm your email',
        html: `
          <h2>Login email confirmation</h2>
          <p>Code to enter is below:</p>
          <p>${tokenData.rawLoginEmailConfirmCode}</p>
        `,
      })
    } else {
      console.log(`
          📧 EMAIL (DEV MODE)
          ────────────────────────────
          To: ${email}
          Subject: Confirm your email

          Login confirmation code:
          👉 ${tokenData.rawLoginEmailConfirmCode}
          ────────────────────────────
          `)
    }
  },
  sendEmailChangeEmail: async (
    newEmail: string,
    tokenData: changeEmailTokenDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    const emailChangeLink = `http://localhost:3000/api/auth/change-email?emailChangeToken=${tokenData.rawEmailChangeToken}`

    if (isProd) {
      await mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: newEmail,
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
        To: ${newEmail}

        Confirmation link:
        👉 ${emailChangeLink}
        ────────────────────────────
        `)
    }
  },

  sendPasswordResetEmail: async (
    email: string,
    tokenData: resetPasswordTokenDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    const resetPasswordLink = `http://localhost:3001/auth/reset-password?resetPasswordToken=${tokenData.rawResetPasswordToken}`

    if (isProd) {
      mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: email,
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
        To: ${email}
        Subject: Reset your password

        Reset password link:
        👉 ${resetPasswordLink}

        (Email was NOT sent. Dev mode)
        ────────────────────────────────
          `)
    }
  },
  sendAdminDeleteUserEmail: async (
    email: string,
    tokenData: adminDeleteUserTokenDTO
  ) => {
    const mailer = getMailer()
    const isProd = process.env.NODE_ENV === 'production'

    const adminDeleteUserLink = `http://localhost:3000/api/auth/admin/users/delete/confirm?adminDeleteUserToken=${tokenData.rawAdminDeleteUserToken}`

    if (isProd) {
      mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: email,
        subject: 'Admin delete user',
        html: `
        <h2>Admin delete user</h2>
        <p>Click the link below:</p>
        <a href="${adminDeleteUserLink}">${adminDeleteUserLink}</a>
      `,
      })
    } else {
      console.log(`
        📧 ADMIN DELETE USER (DEV MODE)
        ────────────────────────────
        To: ${email}

        Confirmation link:
        👉 ${adminDeleteUserLink}
        ────────────────────────────
        `)
    }
  },
}
