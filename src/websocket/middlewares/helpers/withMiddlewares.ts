import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'

type Middleware = (socket: Socket, data: any, ctx: any, next: IoNextFn) => void
type Handler = (socket: Socket, data: any, ctx: any, next: IoNextFn) => void

export const withMiddlewares = (
  socket: Socket,
  mws: Middleware[],
  handler: Handler
) => {
  return (data: any) => {
    let i = 0
    const ctx = {}

    const next = (err?: Error) => {
      if (err) {
        console.log(err.message)
        return
      }

      const mw = mws[i++]

      if (mw) {
        try {
          mw(socket, data, ctx, next)
        } catch (err) {
          next(err)
        }
      } else {
        handler(socket, data, ctx, next)
      }
    }
    next()
  }
}
