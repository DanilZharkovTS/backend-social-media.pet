import crypto from 'crypto'

export const generateResetPasswordToken = () => {
  const rawResetPasswordToken = crypto.randomBytes(64).toString('base64url')
  const hashedResetPasswordToken = crypto
    .createHash('sha256')
    .update(rawResetPasswordToken)
    .digest('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  return { rawResetPasswordToken, hashedResetPasswordToken, expiresAt }
}
