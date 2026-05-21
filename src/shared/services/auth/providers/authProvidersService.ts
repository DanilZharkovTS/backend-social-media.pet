import axios from 'axios'
import {
  AuthProvider,
  ProviderCallbackHandler,
  ProviderUrlHandler,
  providerUserDTO,
} from '../../../interfaces/auth/authInterfaces'
import { userRepo } from '../../../repos/userRepo'
import { generateRefreshToken } from '../../../utils/helpers/auth/refreshToken'
import { authRepo } from '../../../repos/authRepo'
import { generateAccessToken } from '../../../utils/helpers/auth/accessToken'
import { ApiError } from '../../../lib/ApiErrors'
import { googleProvider } from './googleProvider'

const providerUrlHandlers: Record<AuthProvider, ProviderUrlHandler> = {
  google: googleProvider.getGoogleAuthUrl,
}

const providerCallbackHandlers: Record<AuthProvider, ProviderCallbackHandler> =
  {
    google: googleProvider.getGoogleUser,
  }

export const authProvidersService = {
  getAuthProviderUrl: (provider: AuthProvider) => {
    const providerUrlHandler = providerUrlHandlers[provider]
    return { url: providerUrlHandler() }
  },
  providerCallback: async (
    provider: AuthProvider,
    code: string,
    state: string
  ) => {
    const providerHandler = providerCallbackHandlers[provider]

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
