import bcrypt from 'bcrypt'
import {
  Session,
  SessionType,
  Time,
} from '../../../interfaces/auth/authInterfaces'
import { sessionService } from '../../../services/auth/sessionService'
import { tokenService } from '../../../services/auth/tokenService'
import { authRepo } from '../../../repos/authRepo'
import { generateRefreshToken } from './refreshToken'

const SALT_ROUNDS = 10

export const authHelpers = {
  hashPassword: (password: string): Promise<string> => {
    return bcrypt.hash(password, SALT_ROUNDS)
  },

  verifyPassword: (plain: string, hashed: string): Promise<boolean> => {
    return bcrypt.compare(plain, hashed)
  },

  isExpired: (date: Date): boolean => {
    return new Date() > date
  },

  issueSessionTokens: async (
    userId: number,
    email: string,
    role: string,
    sessionType: SessionType,
    deviceName: string,
    interval: { value: number; unit: Time }
  ) => {
    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken(interval.unit, interval.value)

    const session: Session = await authRepo.insertSession(
      userId,
      sessionType,
      deviceName,
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
      session.id,
      sessionType
    )

    return { rawRefreshToken, hashedRefreshToken, accessToken, session }
  },

  rotateSession: async (
    oldRefreshToken: string | null | undefined,
    userId: number,
    email: string,
    role: string,
    sessionType: SessionType,
    deviceName: string,
    interval: { value: number; unit: Time } = {
      value: 30,
      unit: 'days' as Time,
    }
  ) => {
    if (oldRefreshToken) {
      await sessionService.revokeSessionByRefresh(oldRefreshToken)
    }
    return authHelpers.issueSessionTokens(
      userId,
      email,
      role,
      sessionType,
      deviceName,
      interval
    )
  },

  buildLoginedPayload: (
    user: { email: string; role: string; id: string },
    session: Session,
    accessToken: string
  ) => {
    return {
      accessToken,
      user: {
        email: user.email,
        role: user.role,
        userId: user.id,
        sessionId: session.id,
        sessionType: session.type,
      },
    }
  },
}
