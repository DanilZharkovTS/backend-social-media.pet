import crypto from 'crypto'

export const generateLoginEmailConfirmToken = () => {
  const rawLoginEmailConfirmToken = crypto.randomBytes(64).toString('base64url')
  const hashedLoginEmailConfirmToken = crypto
    .createHash('sha256')
    .update(rawLoginEmailConfirmToken)
    .digest('hex')

  const rawLoginEmailConfirmCode = Math.floor(100000 + Math.random() * 900000)
  const hashedLoginEmailConfirmCode = crypto
    .createHash('sha256')
    .update(String(rawLoginEmailConfirmCode))
    .digest('hex')

  const expiresAt = new Date(Date.now() + 3 * 60 * 1000)

  return {
    rawLoginEmailConfirmToken,
    hashedLoginEmailConfirmToken,
    rawLoginEmailConfirmCode,
    hashedLoginEmailConfirmCode,
    expiresAt,
  }
}
