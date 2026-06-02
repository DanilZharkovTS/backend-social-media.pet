import crypto from 'crypto'
import { Time } from '../../../interfaces/auth/authInterfaces'

export const generateRefreshToken = (unit?: Time, value?: number,) => {
  const rawRefreshToken = crypto.randomBytes(64).toString('base64url')
  const hashedRefreshToken = crypto
    .createHash('sha256')
    .update(rawRefreshToken)
    .digest('hex')
  
  const refreshExpiresAt = new Date()

  switch (unit) {
    case 'minutes':
      refreshExpiresAt.setMinutes(refreshExpiresAt.getMinutes() + value)
      break

    case 'hours':
      refreshExpiresAt.setHours(refreshExpiresAt.getHours() + value)
      break

    case 'days':
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + value)
      break
    
    default:
      refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 30)
      break
  }


  return { rawRefreshToken, hashedRefreshToken, refreshExpiresAt }
}
