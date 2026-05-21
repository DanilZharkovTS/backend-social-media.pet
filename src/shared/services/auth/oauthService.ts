import axios from 'axios'
import { AuthProvider } from '../../interfaces/auth/authInterfaces'
import { userRepo } from '../../repos/userRepo'
import { generateRefreshToken } from '../../utils/helpers/auth/refreshToken'
import { authRepo } from '../../repos/authRepo'
import { generateAccessToken } from '../../utils/helpers/auth/accessToken'

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
  console.log("🚀 providerCallback started", { provider, code, state })

  switch (provider) {
    case "google":
      try {
        console.log("📡 Step 1: exchanging code for token")

        const { data: res } = await axios.post(
          "https://oauth2.googleapis.com/token",
          new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.GOOGLE_REDIRECT_URI,
          })
        )

        console.log("✅ Step 1 done: token received", {
          hasAccessToken: !!res?.access_token,
          expiresIn: res?.expires_in,
        })

        console.log("📡 Step 2: fetching userInfo")

        const { data: userInfo } = await axios.get(
          "https://openidconnect.googleapis.com/v1/userinfo",
          {
            headers: {
              Authorization: `Bearer ${res.access_token}`,
            },
          }
        )

        console.log("✅ Step 2 done: userInfo received", userInfo)

        console.log("📡 Step 3: checking user in DB", userInfo.email)

        const userResult = await userRepo.findByEmail(userInfo.email)

        console.log("📦 DB result:", userResult?.rows?.length)

        let user = userResult.rows[0]

        if (!user) {
          console.log("🆕 User not found → creating user")

          user = await userRepo.createVerifiedUser({
            email: userInfo.email,
            name: userInfo.name,
            avatar_url: userInfo.picture,
          })

          console.log("✅ User created:", user)
        } else {
          console.log("👤 User found:", user.id)
        }

        console.log("📡 Step 4: generating refresh token")

        const {
          rawRefreshToken,
          hashedRefreshToken,
          refreshExpiresAt,
        } = generateRefreshToken()

        console.log("🔐 Refresh token generated")

        await authRepo.insertRefreshToken(
          user.id,
          hashedRefreshToken,
          refreshExpiresAt
        )

        console.log("💾 Refresh token saved")

        console.log("📡 Step 5: generating access token")

        const accessToken = generateAccessToken(
          user.id,
          user.email,
          user.role
        )

        console.log("🎉 Auth flow completed")

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
      } catch (err) {
        console.error("❌ GOOGLE OAUTH FAILED", {
          message: err.message,
          response: err.response?.data,
          stack: err.stack,
        })

        throw err
      }

    default:
      console.warn("⚠️ Unknown provider:", provider)
      break
  }
}
}
