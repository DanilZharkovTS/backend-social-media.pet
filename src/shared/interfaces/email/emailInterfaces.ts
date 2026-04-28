export interface verifyEmailTokenDTO {
  rawEmailVerificationToken: string
  hashedEmailVerificationToken: string
  expiresAt: Date
}

export interface loginEmailConfirmTokenDTO {
  rawLoginEmailConfirmToken: string
  hashedLoginEmailConfirmToken: string
  rawLoginEmailConfirmCode: number
  hashedLoginEmailConfirmCode: string
  expiresAt: Date
}

export interface resetPasswordTokenDTO {
  rawResetPasswordToken: string
  hashedResetPasswordToken: string
  expiresAt: Date
}

export interface changeEmailTokenDTO {
  rawEmailChangeToken: string
  hashedEmailChangeToken: string
  expiresAt: Date
}

export interface adminDeleteUserTokenDTO {
  rawAdminDeleteUserToken: string
  hashedAdminDeleteUserToken: string
  expiresAt: Date
}
