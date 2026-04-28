import crypto from 'crypto'

export const generateTrustedDeviceToken = () => {
  const rawTrustedDeviceToken = crypto.randomBytes(64).toString('base64url')
  const hashedTrustedDeviceToken = crypto
    .createHash('sha256')
    .update(rawTrustedDeviceToken)
    .digest('hex')
  const trustedDeviceExpiresAt = new Date()
  trustedDeviceExpiresAt.setDate(trustedDeviceExpiresAt.getDate() + 30)

  return { rawTrustedDeviceToken, hashedTrustedDeviceToken, trustedDeviceExpiresAt }
}
