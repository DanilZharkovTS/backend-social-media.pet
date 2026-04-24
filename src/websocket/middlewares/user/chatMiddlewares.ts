import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'
import { chatValidator } from '../../../utils/validators/chatValidator'
import { ApiError } from '../../../lib/ApiErrors'

export const ioChatMiddlewares = {
  requireRoomMember: (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    const chatId = ctx.validIds.chatId

    if (!socket.rooms.has(`chats:${chatId}`)) {
      throw ApiError('You are not in this chat', 403)
    }

    next()
  },
  addPeep: (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    try {
      const { content } = data
      const validData = chatValidator.addPeepBody.parse({ content })

      ctx.validData = validData
      next()
    } catch (err) {
      next(err)
    }
  },
  editPeep: (socket: Socket, data: any, ctx: any, next: IoNextFn) => {
    try {
      console.log('hit')

      const { content } = data
      const validData = chatValidator.editPeepBody.parse({ content })

      ctx.validData = validData
      next()
    } catch (err) {
      next(err)
    }
  },
  setChatAutoDeletePeeps: (
    socket: Socket,
    data: any,
    ctx: any,
    next: IoNextFn
  ) => {
    try {
      const validData = chatValidator.updateChatAutoDeleteSchema.parse(data)
      ctx.validData = validData
      next()
    } catch (err) {
      next(err)
    }
  },
}
