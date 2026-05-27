import axios from 'axios'
import { ApiError } from '../../../lib/ApiErrors'
import { AuthProvider, UserPrimaryProvider } from '../../../interfaces/auth/authInterfaces'

export const googleProvider = {
  getGoogleAuthUrl: (state: string) => {
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile&access_type=offline&prompt=consent&state=${state}`
    return url
  },
  fetchGoogleTokens: async (code: string) => {
    const { data } = await axios.post(
      'https://oauth2.googleapis.com/token',
      new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      })
    )

    if (!data.access_token) {
      throw ApiError('Google access token was not received', 401)
    }

    return data
  },
  fetchGoogleUserInfo: async (accessToken: string) => {
    const { data } = await axios.get(
      'https://openidconnect.googleapis.com/v1/userinfo',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    return data
  },
  getGoogleUser: async (code: string) => {
    try {
      const { access_token } = await googleProvider.fetchGoogleTokens(code)
      const userInfo = await googleProvider.fetchGoogleUserInfo(access_token)

      return {
        email: userInfo.email,
        name: userInfo.name,
        avatar_url: userInfo.picture,
        primary_provider: 'google' as UserPrimaryProvider,
        provider: 'google' as AuthProvider,
        provider_id: userInfo.sub,
      }
    } catch (err) {
      throw ApiError('Google authentication failed', 401)
    }
  },
}
