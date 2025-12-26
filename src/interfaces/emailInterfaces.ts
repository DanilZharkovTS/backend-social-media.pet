export type actionTokenType =
  | 'PASSWORD_RESET'
  | 'EMAIL_VERIFY'
  | 'LOGIN_EMAIL_CONFIRM'
  | 'EMAIL_CHANGE'
  | 'INVITE'

export interface loginEmailConfirmDTO {
  hashedToken: string
  hashedCode: string
}

export interface requestChangeEmailDTO {
  newEmail: string
}

export interface forgotPasswordDTO {
  email: string
}

export interface resetPasswordDTO {
  newPassword: string
  confirmPassword: string
}
