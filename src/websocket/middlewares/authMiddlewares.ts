import jwt from 'jsonwebtoken'
import { IoNextFn } from '../../interfaces/global/socket'
import { Socket } from 'socket.io'
import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { ApiError } from '../../lib/ApiErrors'

export const ioAuthMiddlewares = {
  verifyAccessToken: (socket: Socket, next: IoNextFn) => {
    const token = socket.handshake.auth.accessToken
    if (!token) {
      console.log('Err')

      return next(new Error('Unauthorized'))
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET) as TokenPayload
      socket.user = payload
      next()
    } catch (err) {
      const error = ApiError('Unauthorized', 401)
      console.log(error)
    }
  },
}
