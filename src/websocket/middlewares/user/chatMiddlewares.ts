import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'
import { chatValidator } from '../../../utils/validators/chatValidator'
import { ApiError } from '../../../lib/ApiErrors'

export const ioChatMiddlewares = {
  requireRoomMember: (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    const chatId = ctx.validIds.chatId

    if (!socket.rooms.has(`chats:${chatId}`)) {
      throw new Error('You are not in this chat')
    }

    next()
  },
  addPeep: (socket: Socket, data: any, ctx: any, next: IoNextFn) => {    
    if (
      typeof data.content !== 'string' ||
      data.content.length < 1 ||
      data.content.length > 400
    ) {
      throw ApiError('Content validation error', 400)
    }    

    ctx.validData = { content: data.content }
    next()
  },
}
