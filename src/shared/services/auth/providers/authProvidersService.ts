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
import { sessionService } from '../sessionService'

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
    redis.set(`auth:state:${state}`, state, 'EX', 10 * 60)

    return {
      response: {
        url: providerUrlHandler(state),
      },
    }
  },
  providerCallback: async (
    provider: AuthProvider,
    code: string,
    state: string,
    deviceName: string,
    refreshToken: string
  ) => {
    const redis = getRedis()
    const redisResult = await redis.get(`auth:state:${state}`)

    if (!redisResult) {
      throw ApiError('Invalid state', 401)
    }

    const providerHandler = providerCallbackHandlers[provider]

    const userInfo = await providerHandler(code)
    console.log(userInfo)

    await redis.del(`auth:state:${state}`)

    if (refreshToken) {
      await sessionService.revokeSessionByRefresh(refreshToken)
    }
    
    return authProvidersService.authenticateProviderUser(userInfo, deviceName)
  },

  authenticateProviderUser: async (
    userInfo: providerUserDTO,
    deviceName: string
  ) => {
    const existing = await userRepo.findByEmailWithProvider(
      userInfo.email,
      userInfo.provider
    )

    if (!existing) {
      const user = await userRepo.createVerifiedUser(userInfo)
      await authRepo.insertUserProvider(
        user.id,
        userInfo.provider,
        userInfo.provider_id
      )

      return authService.issueTokens(user, deviceName, 'normal', {
        value: 30,
        unit: 'days',
      })
    }

    if (!existing.provider) {
      await authRepo.insertUserProvider(
        existing.id,
        userInfo.provider,
        userInfo.provider_id
      )
      await cacheService.invalidateByPrefix(`users:${existing.id}:providers`)
    }

    return authService.issueTokens(existing, deviceName, 'normal', {
      value: 30,
      unit: 'days',
    })
  },
  generateState: () => {
    const state = crypto.randomUUID()
    return state
  },
}
