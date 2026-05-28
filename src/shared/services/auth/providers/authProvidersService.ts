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
import { ApiError } from '../../../lib/ApiErrors'
import { googleProvider } from './googleProvider'
import { githubProvider } from './githubProvider'
import { discordProvider } from './discordProvider'
import { getRedis } from '../../../lib/redisClient'
import { cacheService } from '../../shared/cacheService'
import { authService } from '../authService'

const providerUrlHandlers: Record<AuthProvider, ProviderUrlHandler> = {
  google: googleProvider.getGoogleAuthUrl,
  github: githubProvider.getGithubAuthUrl,
  discord: discordProvider.getDiscordAuthUrl,
}

const providerCallbackHandlers: Record<string, ProviderCallbackHandler> = {
  google: googleProvider.getGoogleUser,
  github: githubProvider.getGithubUser,
  discord: discordProvider.getDiscordUser,
}

export const authProvidersService = {
  getAuthProviderUrl: (provider: AuthProvider) => {
    const redis = getRedis()
    const state = authProvidersService.generateState()

    const providerUrlHandler = providerUrlHandlers[provider]
    redis.set(`auth:state:${state}`, state, 'EX', 15)

    return {
      response: {
        url: providerUrlHandler(state),
      },
    }
  },
  providerCallback: async (
    provider: AuthProvider,
    code: string,
    state: string
  ) => {
    const redis = getRedis()
    const redisResult = await redis.get(`auth:state:${state}`)

    if (!redisResult) {
      throw ApiError('Invalid state', 401)
    }

    const providerHandler = providerCallbackHandlers[provider]

    const userInfo = await providerHandler(code)

    await redis.del(`auth:state:${state}`)

    return authProvidersService.authenticateProviderUser(userInfo)
  },
  authenticateProviderUser: async (userInfo: providerUserDTO) => {
    const userResult = await userRepo.findByEmail(userInfo.email)
    let user = userResult.rows[0]
    const primaryProvider = user?.primary_provider

    if (!user) {
      user = await userRepo.createVerifiedUser(userInfo)
    }

    const existingProvider = await authRepo.findProviderByProviderId(
      userInfo.provider,
      userInfo.provider_id
    )

    if (!existingProvider || existingProvider.provider !== userInfo.provider) {
      const key = `users:${user.id}:providers`

      await authRepo.insertUserProvider(
        user.id,
        userInfo.provider,
        userInfo.provider_id
      )
      await cacheService.invalidateByPrefix(key)
    }

    return authService.issueTokens(user)
  },
  generateState: () => {
    const state = crypto.randomUUID()
    return state
  },
}
