import axios from 'axios'
import {
  AuthProvider,
  ProviderHandler,
  providerUserDTO,
} from '../../../interfaces/auth/authInterfaces'
import { userRepo } from '../../../repos/userRepo'
import { generateRefreshToken } from '../../../utils/helpers/auth/refreshToken'
import { authRepo } from '../../../repos/authRepo'
import { generateAccessToken } from '../../../utils/helpers/auth/accessToken'
import { ApiError } from '../../../lib/ApiErrors'
import { googleProvider } from './googleProvider'

const providerHandlers: Record<AuthProvider, ProviderHandler> = {
  google: googleProvider.getGoogleUser,
}

export const authProvidersService = {
  getGoogleAuthUrl: () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`
    return url
  },
  getAuthProviderUrl: (provider: AuthProvider) => {
    let url: string
    switch (provider) {
      case 'google':
        url = authProvidersService.getGoogleAuthUrl()
        break
    }
    return { url }
  },
  providerCallback: async (
    provider: AuthProvider,
    code: string,
    state: string
  ) => {
    const providerHandler = providerHandlers[provider]

    if (!providerHandler) {
      throw ApiError('Provider is not allowed', 400)
    }

    const userInfo = await providerHandler(code)
    
    return authProvidersService.authenticateProviderUser(userInfo)
  },
  authenticateProviderUser: async (userInfo: providerUserDTO) => {
    const userResult = await userRepo.findByEmail(userInfo.email)
    let user = userResult.rows[0]

    if (!user) {
      user = await userRepo.createVerifiedUser(userInfo)
    }

    const { rawRefreshToken, hashedRefreshToken, refreshExpiresAt } =
      generateRefreshToken()

    await authRepo.insertRefreshToken(
      user.id,
      hashedRefreshToken,
      refreshExpiresAt
    )

    const accessToken = generateAccessToken(user.id, user.email, user.role)

    return {
      response: {
        accessToken,
        user: {
          email: user.email,
          role: user.role,
          userId: user.id,
        },
      },
      refreshToken: rawRefreshToken,
    }
  },
}
