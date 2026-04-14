import { Socket } from 'socket.io'
import { chatPeepService } from '../../services/user/chat/chatPeepService'
import { IoNextFn } from '../../interfaces/global/socket'
import {
  addPeepDTO,
  deletePeepDTO,
  editPeepDTO,
  markPeepsAsReadUpToDTO,
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

      socket.emit('newPeep', result)
      socket.to(`chats:${chatId}`).emit('newPeep', result)
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
      socket.to(`chats:${result.editedPeep.chat_id}`).emit(`editedPeep`, result)
    } catch (err) {
      next(err)
    }
  },
  deletePeep: async (
    socket: Socket,
    data: any,
    ctx: deletePeepDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await chatPeepService.deletePeep(socket.user, ctx)

      socket.emit(`deletedPeep`, result)
      socket
        .to(`chats:${result.deletedPeep.chat_id}`)
        .emit(`deletedPeep`, result)
    } catch (err) {
      next(err)
    }
  },
  markPeepsAsReadUpTo: async (
    socket: Socket,
    data: any,
    ctx: markPeepsAsReadUpToDTO,
    next: IoNextFn
  ) => {
    try {
      const { chatId } = ctx.validIds

      const result = await chatPeepService.markPeepsAsReadUpTo(socket.user, ctx)
      if (result) {
        socket.emit('readPeeps', result)
        socket.to(`chats:${chatId}`).emit('readPeeps', result)
      }
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
}
