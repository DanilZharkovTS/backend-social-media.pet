import crypto from 'crypto'

export const generateRefreshToken = () => {
  const rawRefreshToken = crypto.randomBytes(64).toString('base64url')
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex')
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 30)

  return { rawRefreshToken, hashedRefreshToken, expiresAt }
}
