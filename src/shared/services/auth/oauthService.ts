import axios from 'axios'
import {
  AuthProvider,
  providerUserDTO,
} from '../../interfaces/auth/authInterfaces'
import { userRepo } from '../../repos/userRepo'
import { generateRefreshToken } from '../../utils/helpers/auth/refreshToken'
import { authRepo } from '../../repos/authRepo'
import { generateAccessToken } from '../../utils/helpers/auth/accessToken'
import { ApiError } from '../../lib/ApiErrors'

export const oauthService = {
  getGoogleAuthUrl: () => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent`
    return url
  },
  getAuthProviderUrl: (provider: AuthProvider) => {
    let url: string
    switch (provider) {
      case 'google':
        url = oauthService.getGoogleAuthUrl()
        break
    }
    return { url }
  },
  providerCallback: async (
    provider: AuthProvider,
    code: string,
    state: string
  ) => {
    switch (provider) {
      case 'google':
        const { data: tokenData } = await axios.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          })
        )

        if (!tokenData.access_token) {
          throw ApiError('Google access token was not received', 401)
        }
        const { data: userInfo } = await axios.get(
          'https://openidconnect.googleapis.com/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${tokenData.access_token}`,
            },
          }
        )
        return oauthService.authenticateProviderUser({
          email: userInfo.email,
          name: userInfo.name,
          avatar_url: userInfo.picture,
        })

      default:
        throw ApiError('Unsupported auth provider', 400)
    }
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
