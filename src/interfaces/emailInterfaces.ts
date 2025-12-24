
export type actionTokenType = 'PASSWORD_RESET' | 'EMAIL_VERIFY' | 'EMAIL_CHANGE' | 'INVITE'

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