import crypto from 'crypto'

export const generateEmailVerificationToken = () => {
  const rawEmailVerificationToken = crypto.randomBytes(64).toString('base64url')
  const hashedEmailVerificationToken = crypto
    .createHash('sha256')
    .update(rawEmailVerificationToken)
    .digest('hex')
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

  return { rawEmailVerificationToken, hashedEmailVerificationToken, expiresAt }
}
