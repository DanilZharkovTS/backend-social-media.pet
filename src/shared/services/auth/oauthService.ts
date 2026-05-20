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
}
