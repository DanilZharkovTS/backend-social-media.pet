export type actionTokenType =
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFY'
  | 'LOGIN_EMAIL_CONFIRM'
  | 'EMAIL_CHANGE'
  | 'INVITE'
  | 'ADMIN_DELETE_USER'

export interface TokenPayload {
  userId: number
  email: string
  role: string
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
  expires_at: Date
  created_at: Date
  revoked: boolean
  email: string
  role: string
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

export type AuthProvider = 'google' | 'github' | 'discord'

export type UserPrimaryProvider = 'google' | 'github' | 'discord' | 'email'

export type SessionType = 'normal' | 'shared'
