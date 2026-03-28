import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'

export const ioChatMiddlewares = {
  requireRoomMember: (socket: Socket, data: any,ctx: any, next: IoNextFn) => {
    const chatId = ctx.validIds.chatId

    if (!socket.rooms.has(`chats:${chatId}`)) {
      throw new Error('You are not in this chat')
    }

    next()
  },
}
