import crypto from 'crypto'

export const generateAdminDeleteUserToken = () => {
  const rawAdminDeleteUserToken = crypto.randomBytes(64).toString('base64url')
  const hashedAdminDeleteUserToken = crypto
    .createHash('sha256')
    .update(rawAdminDeleteUserToken)
    .digest('hex')
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

  return { rawAdminDeleteUserToken, hashedAdminDeleteUserToken, expiresAt }
}
