import { Socket } from 'socket.io'
import { chatPeepService } from '../../services/user/chat/chatPeepService'
import { IoNextFn } from '../../interfaces/global/socket'
import {
  addPeepDTO,
  editPeepDTO,
} from '../../interfaces/user/chat/chatInterfaces'

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
      console.log('Peep added')
    } catch (err) {
      next(err)
    }
  },
  editPeep: async (
    socket: Socket,
    data: any,
    ctx: editPeepDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await chatPeepService.editPeep(socket.user, ctx)

      socket.emit(`editedPeep`, result)
      socket
        .to(`chats:${result.editedPeep.chat_id}}`)
        .emit(`editedPeep`, result)
      console.log('Edited peep')
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
}
