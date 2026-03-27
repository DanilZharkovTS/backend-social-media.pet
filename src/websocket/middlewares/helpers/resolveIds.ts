import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'

export const resolveIds = (idNames: string[]) => {
  return (socket: Socket, next: IoNextFn) => {
    const validIds: Record<string, number> = {}

    for (const name of idNames) {
      const id = socket.data[name]
      let idNum = parseInt(String(id), 10)

      if (isNaN(idNum) || idNum < 1) {
        throw new Error(`Param ${name}: ${idNum} needs to be a natural number`)
      }

      validIds[name] = idNum
    }
    socket.data.validIds = validIds
    next()
  }
}

resolveIds
