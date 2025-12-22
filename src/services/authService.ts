import bcrypt from 'bcrypt'
import type {
  loginUserDTO,
  registerUserDTO,
} from '../interfaces/authInterfaces.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateRefreshToken } from '../utils/helpers/auth/refreshToken.ts'
import { authRepo } from '../repos/authRepo.ts'
import { generateAccessToken } from '../utils/helpers/auth/accessToken.ts'
import { generateEmailVerificationToken } from '../utils/helpers/auth/emailVerificationToken.ts'
import { getMailer } from '../lib/mailer.ts'
import { ApiError } from '../lib/ApiErrors.ts'

export const authService = {
  register: async (data: registerUserDTO) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)
    data.password = hashedPassword

    const userResult = await userRepo.createUser(data)
    const userDb = userResult.rows[0]

    const {
      rawEmailVerificationToken,
      hashedEmailVerificationToken,
      expiresAt,
    } = generateEmailVerificationToken()

    await authRepo.insertEmailVerificationToken(
      userDb.id,
      hashedEmailVerificationToken,
      expiresAt
    )

    const link = `http://localhost:3000/api/auth/verify-email?emailToken=${rawEmailVerificationToken}`

    const mailer = getMailer()

    mailer.sendMail({
      from: '"My App" <no-reply@myapp.dev>',
      to: 'test@gmail.com',
      subject: 'Verify your email',
      html: `
      <h2>Email verification</h2>
      <p>Click the link below:</p>
      <a href="${link}">${link}</a>
    `,
    })

    return { registered: userDb }
  },
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
      throw ApiError('Your verification token is expired', 400)
    }

    const now: Date = new Date()
    await authRepo.revokeEmailVerificationTokenById(now, dbToken.id)

    await userRepo.updateIsVerified(true, dbToken.user_id)

    return { emailIsVerified: true }
  },
  login: async (data: loginUserDTO) => {
    const user = await userRepo.findByEmail(data.email)
    const isValidPassword = await bcrypt.compare(
      data.password,
      user.rows[0].password
    )
    if (!isValidPassword) throw new Error('Email or password are not right')

    const { rawRefreshToken, hashedRefreshToken, expiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      user.rows[0].id,
      hashedRefreshToken,
      expiresAt
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

    if (dbTokenResult.rows.length === 0) {
      throw new Error('Invalid or expired refresh token')
    }

    const dbToken = dbTokenResult.rows[0]

    if (new Date() > dbToken.expires_at || dbToken.revoked) {
      throw new Error('Invalid or expired refresh token')
    }

    await authRepo.revokeRefreshTokenById(dbToken.id)

    const { rawRefreshToken, hashedRefreshToken, expiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      dbToken.user_id,
      hashedRefreshToken,
      expiresAt
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
    if (refreshTokenResult.rows.length === 0)
      throw new Error('Invalid or expired refresh token')

    await authRepo.revokeRefreshTokenById(refreshTokenResult.rows[0].id)

    return { auth: false }
  },
}
