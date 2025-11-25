import bcrypt from 'bcrypt'
import { v4 as uuid } from 'uuid'
import type {
  loginUserDTO,
  registerUserDTO,
} from '../interfaces/authInterfaces.ts'
import { userRepo } from '../repos/userRepo.ts'
import { generateRefreshToken } from '../utils/helpers/auth/refreshToken.ts'
import { authRepo } from '../repos/authRepo.ts'
import { generateAccessToken } from '../utils/helpers/auth/accessToken.ts'

export const authService = {
  register: async (data: registerUserDTO) => {
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(data.password, saltRounds)
    data.password = hashedPassword

    const result = await userRepo.createUser(data)
    return { registered: result.rows[0] }
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

    const accessToken = generateAccessToken(user.rows[0].id, user.rows[0].email)

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
    
    await authRepo.revokeRefreshTokenById(dbToken.id)

    const { rawRefreshToken, hashedRefreshToken, expiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      dbToken.user_id,
      hashedRefreshToken,
      expiresAt
    )

    const accessToken = generateAccessToken(dbToken.user_id, dbToken.email)

    return {
      refreshToken: rawRefreshToken,
      logined: { accessToken },
    }
  },
}
