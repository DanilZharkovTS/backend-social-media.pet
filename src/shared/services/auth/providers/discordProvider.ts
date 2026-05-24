import axios from 'axios'
import { ApiError } from '../../../lib/ApiErrors'

export const discordProvider = {
  getDiscordAuthUrl: () => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${process.env.DISCORD_REDIRECT_URI}&response_type=code&scope=identify%20email`
    return url
  },
  fetchDiscordTokens: async (code: string) => {
    const { data } = await axios.post(
      'https://discord.com/api/oauth2/token',
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      })
    )

    if (!data.access_token) {
      throw ApiError('Discord access token was not received', 401)
    }

    return data
  },
  fetchDiscordUser: async (token: string) => {
    const { data } = await axios.get('https://discord.com/api/users/@me', {
      headers: { Authorization: `Bearer ${token}` },
    })
    return data
  },
  getDiscordUser: async (code: string) => {
    const { access_token } = await discordProvider.fetchDiscordTokens(code)
    const userInfo = await discordProvider.fetchDiscordUser(access_token)

    const avatar_url = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`

    return {
      email: userInfo.email,
      name: userInfo.username,
      avatar_url,
    }
  },
}
