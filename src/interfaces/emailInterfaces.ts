export type actionTokenType =
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFY'
  | 'LOGIN_EMAIL_CONFIRM'
  | 'EMAIL_CHANGE'
  | 'INVITE'
  | 'ADMIN_DELETE_USER'

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
