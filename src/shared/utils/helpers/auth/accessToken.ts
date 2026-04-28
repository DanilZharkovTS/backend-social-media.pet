import jwt from 'jsonwebtoken'

export const generateAccessToken = (userId: number, email: string, role: string) => {
  const accessToken = jwt.sign({ userId, email, role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  })
  return accessToken
}
