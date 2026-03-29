import { Socket } from 'socket.io'
import { chatPeepService } from '../../services/user/chat/chatPeepService'
import { IoNextFn } from '../../interfaces/global/socket'
import { addPeepDTO } from '../../interfaces/user/chat/chatInterfaces'

export const chatPeepHandler = {
  addPeep: async (
    socket: Socket,
    data: any,
    ctx: addPeepDTO,
    next: IoNextFn
  ) => {
    try {      
      const chatId = ctx.validIds.chatId      
      const result = await chatPeepService.addPeep(socket.user, ctx)

      socket.emit('newPeep', result.newPeep)
      socket.to(`chats:${chatId}`).emit('newPeep', result.newPeep)      
    } catch (err) {
      next(err)
    }
  },
}
