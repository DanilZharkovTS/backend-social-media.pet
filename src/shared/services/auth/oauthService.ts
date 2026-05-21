import axios from 'axios'
import { AuthProvider } from '../../interfaces/auth/authInterfaces'

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
        const { data: res } = await axios.post(
          'https://oauth2.googleapis.com/token',
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: 'authorization_code',
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          })
        )

        const { data: user } = await axios.get(
          'https://openidconnect.googleapis.com/v1/userinfo',
          {
            headers: {
              Authorization: `Bearer ${res.access_token}`,
            },
          }
        )
        console.log(user);
        

        break

      default:
        break
    }
  },
}
