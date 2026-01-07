import bcrypt from 'bcrypt'
import type {
  loginUserDTO,
  registerUserDTO,
  TokenPayload,
  forgotPasswordDTO,
  loginEmailConfirmDTO,
  requestChangeEmailDTO,
  resetPasswordDTO,
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

    const userToCreate = {
      email: data.email,
      password: hashedPassword,
      name: data.name,
    }

    const createdUserResult = await userRepo.createUser(userToCreate)
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

      return { logined: tokenData.rawLoginEmailConfirmToken }
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
}
