export type actionTokenType =
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFY'
  | 'LOGIN_EMAIL_CONFIRM'
  | 'EMAIL_CHANGE'
  | 'INVITE'
  | 'ADMIN_DELETE_USER'
  | 'ACCOUNT_INVITE'

export interface TokenPayload {
  userId: number
  email: string
  role: string
  sessionType: SessionType
}

export interface RefreshToken {
  id: number
  user_id: number
  token: string
  device: string | null
  ip: string | null
  expires_at: Date
  created_at: Date
  revoked: boolean
}

export interface RefreshTokenWithUser {
  id: number
  user_id: number
  token: string
  session_id: number
  device: string | null
  ip: string | null
  refresh_expires_at: Date
  created_at: Date
  refresh_revoked: boolean
  email: string
  role: string
}

export interface Session {
  id: number
  user_id: number
  type: SessionType
  name: string | null
  expires_at: Date
  revoked_at: Date | null
  created_at: Date
}

export interface registerUserDTO {
  email: string
  password: string
  name: string
  primary_provider: UserPrimaryProvider
}

export interface providerUserDTO {
  email: string
  name: string
  avatar_url: string
  primary_provider: UserPrimaryProvider
  provider: AuthProvider
  provider_id: string
}

export type ProviderCallbackHandler = (code: string) => Promise<providerUserDTO>

export type ProviderUrlHandler = (state: string) => string

export interface loginUserDTO {
  email: string
  password: string
}

export interface loginEmailConfirmDTO {
  hashedToken: string
  hashedCode: string
}

export interface requestChangeEmailDTO {
  password: string
  newEmail: string
}

export interface forgotPasswordDTO {
  email: string
}

export interface resetPasswordDTO {
  newPassword: string
  confirmPassword: string
}

export interface accountInviteUrlDTO {
  password: string
  interval: {
    unit: Time
    value: number
  }
}

export interface revokeAllSessionsDTO {
  validData: {
    token: string
  }
}

export type Time = 'minutes' | 'hours' | 'days'

export type AuthProvider = 'google' | 'github' | 'discord'

export type UserPrimaryProvider = 'google' | 'github' | 'discord' | 'email'

export type SessionType = 'normal' | 'shared'
