import type {
  loginUserDTO,
  registerUserDTO,
} from '../interfaces/authInterfaces.ts'
import bcrypt from 'bcrypt'
import { getMailer } from '../lib/mailer.ts'
import { ApiError } from '../lib/ApiErrors.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateRefreshToken } from '../utils/helpers/auth/refreshToken.ts'
import { authRepo } from '../repos/authRepo.ts'
import { generateAccessToken } from '../utils/helpers/auth/accessToken.ts'
import { generateEmailVerificationToken } from '../utils/helpers/auth/emailVerificationToken.ts'
import { generateLoginEmailConfirmToken } from '../utils/helpers/auth/loginEmailConfirmToken.ts'

export const authService = {
  register: async (data: registerUserDTO) => {
    const existingUserResult = await userRepo.findByEmail(data.email)
    const existingUser = existingUserResult.rows[0]

    if (existingUser && !existingUser.email_is_verified) {
      await userRepo.deleteUserById(existingUser.id)
    }

    if (existingUser && existingUser.email_is_verified) {
      throw ApiError('This email is already being used', 409)
    }

    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)

    const userToCreate = {
      ...data,
      password: hashedPassword,
    }

    const createdUserResult = await userRepo.createUser(userToCreate)
    const createdUser = createdUserResult.rows[0]

    const {
      rawEmailVerificationToken,
      hashedEmailVerificationToken,
      expiresAt,
    } = generateEmailVerificationToken()

    await authRepo.insertActionToken(
      createdUser.id,
      hashedEmailVerificationToken,
      expiresAt,
      'EMAIL_VERIFY'
    )

    const verificationLink = `http://localhost:3000/api/auth/verify-email?emailToken=${rawEmailVerificationToken}`

    const mailer = getMailer()

    await mailer.sendMail({
      from: '"My App" <no-reply@myapp.dev>',
      to: createdUser.email,
      subject: 'Verify your email',
      html: `
      <h2>Email verification</h2>
      <p>Click the link below:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
    })

    return {
      user: createdUser,
    }
  },
  login: async (data: loginUserDTO, trustedDeviceToken: string) => {
    const mailer = getMailer()

    const user = await userRepo.findByEmail(data.email)
    if (user.rows.length == 0) {
      throw ApiError('Email or password is not right', 400)
    }

    const dbUser = user.rows[0]
    if (!dbUser.email_is_verified) throw ApiError('Email was not verified', 403)

    const isValidPassword = await bcrypt.compare(data.password, dbUser.password)
    if (!isValidPassword) throw ApiError('Email or password is not right', 400)

    const trustedDevice = await authRepo.selectTrustedDeviceByToken(
      trustedDeviceToken
    )

    if (
      !trustedDevice ||
      trustedDevice.user_id !== dbUser.id ||
      new Date() > trustedDevice.expires_at
    ) {
      const {
        rawLoginEmailConfirmToken,
        hashedLoginEmailConfirmToken,
        rawLoginEmailConfirmCode,
        hashedLoginEmailConfirmCode,
        expiresAt,
      } = generateLoginEmailConfirmToken()

      await authRepo.insertLoginEmailConfirmToken(
        dbUser.id,
        hashedLoginEmailConfirmToken,
        expiresAt,
        hashedLoginEmailConfirmCode,
        'LOGIN_EMAIL_CONFIRM'
      )

      mailer.sendMail({
        from: '"My App" <no-reply@myapp.dev>',
        to: dbUser.email,
        subject: 'Confirm your email',
        html: `
      <h2>Login email confirmation</h2>
      <p>Code to enter is below:</p>
      <p>${rawLoginEmailConfirmCode}</p>
    `,
      })

      return { loginEmailConfirmToken: rawLoginEmailConfirmToken }
    }

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      user.rows[0].id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = generateAccessToken(
      user.rows[0].id,
      user.rows[0].email,
      user.rows[0].role
    )

    return {
      refreshToken: rawRefreshToken,
      logined: { accessToken, user: user.rows[0] },
    }
  },
  refresh: async (clientRefreshToken: string) => {
    const dbTokenResult = await authRepo.selectRefreshTokenByToken(
      clientRefreshToken
    )
    const dbToken = dbTokenResult.rows[0]

    if (!dbToken || new Date() > dbToken.expires_at || dbToken.revoked) {
      throw ApiError('Invalid or expired refresh token', 401)
    }

    await authRepo.revokeRefreshTokenById(dbToken.id)

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      dbToken.user_id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = generateAccessToken(
      dbToken.user_id,
      dbToken.email,
      dbToken.role
    )

    return {
      refreshToken: rawRefreshToken,
      logined: {
        accessToken,
        user: {
          email: dbToken.email,
          role: dbToken.role,
          userId: dbToken.user_id,
        },
      },
    }
  },
  logout: async (clientRefreshToken: string) => {
    const refreshTokenResult = await authRepo.selectRefreshTokenByToken(
      clientRefreshToken
    )
    if (refreshTokenResult.rows.length === 0) {
      throw ApiError('Invalid or expired refresh token', 401)
    }

    await authRepo.revokeRefreshTokenById(refreshTokenResult.rows[0].id)

    return { auth: false }
  },
}
