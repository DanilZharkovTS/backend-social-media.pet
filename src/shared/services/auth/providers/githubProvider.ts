import axios from 'axios'
import { ApiError } from '../../../lib/ApiErrors'
import {
  AuthProvider,
  UserPrimaryProvider,
} from '../../../interfaces/auth/authInterfaces'

export const githubProvider = {
  getGithubAuthUrl: (state: string) => {
    const url = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&redirect_uri=${process.env.GITHUB_REDIRECT_URI}&scope=user:email&state=${state}&prompt=consent`
    return url
  },
  fetchGithubTokens: async (code: string) => {
    const { data } = await axios.post(
      'https://github.com/login/oauth/access_token',
      new URLSearchParams({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: process.env.GITHUB_REDIRECT_URI,
      }),
      {
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!data.access_token) {
      throw ApiError('Github access token was not received', 401)
    }

    return data
  },
  fetchGithubUser: async (token: string) => {
    console.log('ACCESS TOKEN', token)
    const { data } = await axios.get('https://api.github.com/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },
  getGithubUser: async (code: string) => {
    const { access_token } = await githubProvider.fetchGithubTokens(code)
    const userInfo = await githubProvider.fetchGithubUser(access_token)
    return {
      email: userInfo.email,
      name: userInfo.name,
      avatar_url: userInfo.avatar_url,
      primary_provider: 'github' as UserPrimaryProvider,
      provider: 'github' as AuthProvider,
      provider_id: userInfo.id,
    }
  },
}
