import crypto from 'crypto'

export const generateEmailChangeToken = () => {
  const rawEmailChangeToken = crypto.randomBytes(64).toString('base64url')
  const hashedEmailChangeToken = crypto
    .createHash('sha256')
    .update(rawEmailChangeToken)
    .digest('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  return { rawEmailChangeToken, hashedEmailChangeToken, expiresAt }
}
