import jwt from 'jsonwebtoken'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import { Socket } from 'socket.io'
import {
  revokeAllSessionsDTO,
  SessionType,
  TokenPayload,
} from '../../shared/interfaces/auth/authInterfaces'
import { ApiError } from '../../shared/lib/ApiErrors'
import cookie from 'cookie'
import { tokenService } from '../../shared/services/auth/tokenService'

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
      next(err)
    }
  },
  requireRoomMember: (roomName: string, idKey: string) => {
    return (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
      const key = idKey ?? `${roomName}Id`
      const roomId = ctx.validIds[key]

      if (roomId === undefined) {
        throw ApiError(`Missing id: ${key}`, 400)
      }

      if (!socket.rooms.has(`${roomName}:${roomId}`)) {
        throw ApiError('You are not in this chat', 403)
      }

      next()
    }
  },
  requireSessionType: (type: SessionType) => {
    return (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
      if (socket.user.sessionType !== type) {
        throw ApiError('Forbidden', 403)
      }
      next()
    }
  },
  validateRefreshToken: (
    socket: Socket,
    data: any,
    ctx: revokeAllSessionsDTO,
    next: IoNextFn
  ) => {    
    const cookies = cookie.parse(socket.handshake.headers.cookie || '')
    const refreshToken = cookies.refreshToken

    if (!refreshToken) {
      throw ApiError('Unauthorized', 401)
    }

    const hashedRefreshToken = tokenService.hash(refreshToken)

    ctx.validData = {
      token: hashedRefreshToken,
    }

    next()
  },
}
