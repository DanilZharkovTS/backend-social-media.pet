import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId: number, email: string) => {
  const accessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })
  return accessToken
}
