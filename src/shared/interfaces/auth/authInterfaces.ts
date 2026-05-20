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
}

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

export type AuthProvider = 'google'
