import bcrypt from 'bcrypt'
import type {
  loginUserDTO,
  registerUserDTO,
  TokenPayload,
  forgotPasswordDTO,
  loginEmailConfirmDTO,
  requestChangeEmailDTO,
  resetPasswordDTO,
  RefreshTokenWithUser,
  SessionType,
  accountInviteUrlDTO,
  Time,
  Session,
} from '../../interfaces/auth/authInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { emailService } from '../email/emailService.ts'
import { userRepo } from '../../repos/userRepo.ts'
import { authRepo } from '../../repos/authRepo.ts'
import { generateRefreshToken } from '../../utils/helpers/auth/refreshToken.ts'
import { generateAccessToken } from '../../utils/helpers/auth/accessToken.ts'
import { generateEmailVerificationToken } from '../../utils/helpers/auth/emailVerificationToken.ts'
import { generateLoginEmailConfirmToken } from '../../utils/helpers/auth/loginEmailConfirmToken.ts'
import { generateResetPasswordToken } from '../../utils/helpers/auth/resetPasswordToken.ts'
import { generateTrustedDeviceToken } from '../../utils/helpers/auth/trustedDeviceToken.ts'
import { generateEmailChangeToken } from '../../utils/helpers/auth/emailChangeToken.ts'
import { getRedis } from '../../lib/redisClient.ts'
import { cacheService } from '../shared/cacheService.ts'
import { tokenService } from './tokenService.ts'
import { sessionService } from './sessionService.ts'

export const authService = {
  register: async (data: registerUserDTO) => {
    const saltRounds = 10

    const existingUserResult = await userRepo.findByEmail(data.email)
    const existingUser = existingUserResult.rows[0]

    if (existingUser && !existingUser.email_is_verified) {
      await userRepo.deleteUserById(existingUser.id)
    }

    if (existingUser && existingUser.email_is_verified) {
      throw ApiError('This email is already being used', 409)
    }

    const hashedPassword = await bcrypt.hash(data.password, saltRounds)

    const createdUserResult = await userRepo.createUser({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      primary_provider: 'email',
    })
    const createdUser = createdUserResult.rows[0]

    const tokenData = generateEmailVerificationToken()

    await authRepo.insertActionToken(
      createdUser.id,
      tokenData.hashedEmailVerificationToken,
      tokenData.expiresAt,
      'EMAIL_VERIFY'
    )

    await emailService.sendVerificationEmail(createdUser.email, tokenData)

    return {
      user: createdUser,
    }
  },
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
  login: async (data: loginUserDTO, trustedDeviceToken: string) => {
    const user = await userRepo.findByEmail(data.email)
    if (user.rows.length == 0) {
      throw ApiError('Email or password is not right', 400)
    }

    const dbUser = user.rows[0]
    if (!dbUser.email_is_verified) throw ApiError('Email was not verified', 403)

    if (!dbUser.password) {
      throw ApiError(
        'This account uses social login. Please continue with Google/GitHub/Discord.',
        400
      )
    }

    const isValidPassword = await bcrypt.compare(data.password, dbUser.password)
    if (!isValidPassword) throw ApiError('Email or password is not right', 400)

    const trustedDevice = await authRepo.selectTrustedDeviceByToken(
      trustedDeviceToken
    )

    const dbTrusetedDevice = trustedDevice.rows[0]

    if (
      !dbTrusetedDevice ||
      dbTrusetedDevice.user_id !== dbUser.id ||
      new Date() > dbTrusetedDevice.expires_at
    ) {
      const tokenData = generateLoginEmailConfirmToken()

      await authRepo.insertLoginEmailConfirmToken(
        dbUser.id,
        tokenData.hashedLoginEmailConfirmToken,
        tokenData.expiresAt,
        tokenData.hashedLoginEmailConfirmCode,
        'LOGIN_EMAIL_CONFIRM'
      )

      await emailService.sendLoginEmailConfirmCode(dbUser.email, tokenData)

      return {
        logined: {
          loginEmailConfirmToken: tokenData.rawLoginEmailConfirmToken,
        },
      }
    }

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()

    const session = await authRepo.insertSession(
      dbUser.id,
      'normal',
      refreshExpiresAt
    )

    await authRepo.insertRefreshToken(
      user.rows[0].id,
      session.id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = tokenService.generateAccessToken(
      user.rows[0].id,
      user.rows[0].email,
      user.rows[0].role,
      'normal'
    )

    return {
      refreshToken: rawRefreshToken,
      logined: {
        accessToken,
        user: {
          email: dbUser.email,
          role: dbUser.role,
          userId: dbUser.id,
          sessionType: 'normal',
        },
      },
    }
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
    console.log(rawRefreshToken)

    const session = await authRepo.insertSession(
      dbUser.id,
      'normal',
      refreshExpiresAt
    )

    await authRepo.insertRefreshToken(
      dbUser.id,
      session.id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = tokenService.generateAccessToken(
      dbUser.id,
      dbUser.email,
      dbUser.role,
      'normal'
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
      logined: {
        accessToken,
        user: {
          email: dbUser.email,
          role: dbUser.role,
          userId: dbUser.id,
          sessionType: 'normal',
        },
      },
    }
  },
  refresh: async (clientRefreshToken: string) => {
    const redis = getRedis()

    const redisKey = `refresh:${clientRefreshToken}`
    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      return authService.handleRefreshCondition(
        JSON.parse(redisResult),
        'redis'
      )
    }

    const dbResult = await authRepo.selectRefreshWithUserAndSessionByToken(
      clientRefreshToken
    )

    const dbToken = dbResult.rows[0]

    return authService.handleRefreshCondition(dbToken, 'db')
  },

  handleRefreshCondition: async (
    token: RefreshTokenWithUser,
    source: 'redis' | 'db'
  ) => {
    const redis = getRedis()

    const session: Session = await authRepo.findSessionById(token.session_id)

    if (
      !token ||
      new Date() > session.expires_at ||
      session.revoked_at ||
      new Date() > token.refresh_expires_at ||
      token.refresh_revoked
    ) {
      throw ApiError('Invalid or expired refresh token', 401)
    }

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()

    const expiresAt =
      session.type === 'normal'
        ? refreshExpiresAt
        : new Date(session.expires_at)

    await authRepo.insertRefreshToken(
      token.user_id,
      token.session_id,
      hashedRefreshToken,
      expiresAt
    )

    const ttl = Math.floor((expiresAt.getTime() - Date.now()) / 1000)

    await redis.set(
      `refresh:${hashedRefreshToken}`,
      JSON.stringify(token),
      'EX',
      ttl
    )

    if (source === 'redis') {
      await redis.del(`refresh:${token.token}`)
    }

    const accessToken = tokenService.generateAccessToken(
      token.user_id,
      token.email,
      token.role,
      session.type
    )

    await authRepo.revokeRefreshTokenById(token.id)

    return {
      refreshToken: rawRefreshToken,
      logined: {
        accessToken,
        user: {
          email: token.email,
          role: token.role,
          userId: token.user_id,
          sessionType: session.type,
        },
      },
    }
  },

  logout: async (clientRefreshToken: string) => {
    const refreshTokenResult =
      await authRepo.selectRefreshWithUserAndSessionByToken(clientRefreshToken)
    if (refreshTokenResult.rows.length === 0) {
      throw ApiError('Invalid or expired refresh token', 401)
    }

    await sessionService.revokeSession(refreshTokenResult.rows[0].session_id)

    await cacheService.invalidateByPrefix(`refresh:${clientRefreshToken}`)

    return { auth: false }
  },
  requestPasswordResetEmail: async (user: TokenPayload) => {
    const userResult = await userRepo.findUserById(user.userId)
    if (userResult.rows.length === 0) throw ApiError('User is not found', 404)

    const dbUser = userResult.rows[0]

    const tokenData = generateResetPasswordToken()

    await authRepo.insertActionToken(
      dbUser.id,
      tokenData.hashedResetPasswordToken,
      tokenData.expiresAt,
      'PASSWORD_RESET'
    )

    await emailService.sendPasswordResetEmail(dbUser.email, tokenData)

    return { passwordResetIsSent: true }
  },
  requestChangeEmail: async (
    user: TokenPayload,
    data: requestChangeEmailDTO
  ) => {
    const userResult = await userRepo.findUserById(user.userId)
    const dbUser = userResult.rows[0]

    const isValidPassword = await bcrypt.compare(data.password, dbUser.password)
    if (!isValidPassword) {
      throw ApiError('Password is not right', 400)
    }

    const existingUserResult = await userRepo.findByEmail(data.newEmail)
    const dbExistingUser = existingUserResult.rows[0]

    if (dbExistingUser && dbExistingUser.email_is_verified) {
      throw ApiError('This email is already being used', 409)
    }

    const tokenData = generateEmailChangeToken()

    await authRepo.insertEmailChangeToken(
      user.userId,
      tokenData.hashedEmailChangeToken,
      tokenData.expiresAt,
      data.newEmail,
      'EMAIL_CHANGE'
    )

    await emailService.sendEmailChangeEmail(data.newEmail, tokenData)

    return { emailWasSent: true }
  },
  changeEmailConfirm: async (token: string) => {
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
    const message =
      'If an account with this email exists, a reset link has been sent'

    const userResult = await userRepo.findByEmail(data.email)
    const dbUser = userResult.rows[0]

    if (!dbUser || !dbUser.email_is_verified) {
      return {
        message,
      }
    }

    const tokenData = generateResetPasswordToken()

    await authRepo.insertActionToken(
      dbUser.id,
      tokenData.hashedResetPasswordToken,
      tokenData.expiresAt,
      'PASSWORD_RESET'
    )

    await emailService.sendPasswordResetEmail(data.email, tokenData)

    return { message }
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
  issueTokens: async (
    { id: userId, email, role },
    sessionType: SessionType,
    interval: {
      value: number
      unit: Time
    }
  ) => {
    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken(interval.unit, interval.value)

    const session = await authRepo.insertSession(
      userId,
      sessionType,
      refreshExpiresAt
    )

    await authRepo.insertRefreshToken(
      userId,
      session.id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = tokenService.generateAccessToken(
      userId,
      email,
      role,
      sessionType
    )

    return {
      tokens: {
        rawRefreshToken,
        hashedRefreshToken,
        accessToken,
      },
    }
  },
  createAccountInviteUrl: async (
    { userId }: TokenPayload,
    data: accountInviteUrlDTO
  ) => {
    const token = await authRepo.findValidActionTokenByUserAndType(
      userId,
      'ACCOUNT_INVITE'
    )

    if (token) {
      return { inviteUrl: token.payload.inviteUrl }
    }

    const { payload } = await tokenService.saveActionToken(
      userId,
      'ACCOUNT_INVITE',
      {
        interval: {
          unit: data.interval.unit,
          value: data.interval.value,
        },
      }
    )

    return {
      inviteUrl: payload.inviteUrl,
    }
  },

  acceptAccountInvite: async (hashedToken: string) => {
    const token = await authRepo.findActionTokenWithUserByToken(hashedToken)

    if (!token || new Date() > token.expires_at || token.used_at) {
      throw ApiError('Account invite token is invalid or expired', 400)
    }

    const {
      payload: { interval },
    } = token

    const {
      tokens: { rawRefreshToken, accessToken },
    } = await authService.issueTokens(
      { id: token.user_id, email: token.email, role: token.role },
      'shared',
      { unit: interval.unit, value: interval.value }
    )

    await authRepo.revokeActionTokenById(token.id)

    return {
      tokens: {
        rawRefreshToken,
      },
      response: {
        accessToken,
        user: {
          id: token.user_id,
          email: token.email,
          role: token.role,
          sessionType: 'shared',
        },
      },
    }
  },
  resolveInvite: async (hashedToken: string) => {
    const {
      user_id,
      email,
      name,
      avatar_url,
      payload: { interval },
    } = await authRepo.findActionTokenWithUserByToken(hashedToken)
    return {
      info: {
        id: user_id,
        email,
        name,
        avatar_url,
        interval: `${interval.value} ${interval.unit}`,
      },
    }
  },
}
