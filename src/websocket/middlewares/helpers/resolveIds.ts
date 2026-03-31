import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'
import { ApiError } from '../../../lib/ApiErrors'

export const resolveIds = (idNames: string[]) => {
  return (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    const validIds: Record<string, number> = {}

    for (const name of idNames) {
      const id = data[name]
      let idNum = parseInt(String(id), 10)

      if (isNaN(idNum) || idNum < 1) {
        throw ApiError(
          `Param ${name}: ${idNum} needs to be a natural number`,
          400
        )
      }

      validIds[name] = idNum
    }
    ctx.validIds = validIds
    next()
  }
}
