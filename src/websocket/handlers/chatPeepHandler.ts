import { Socket } from 'socket.io'
import { chatPeepService } from '../../shared/services/user/chat/chatPeepService'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import {
  addPeepDTO,
  deletePeepDTO,
  editPeepDTO,
  markPeepsAsReadUpToDTO,
  updateReactionDTO,
} from '../../shared/interfaces/user/chat/chatInterfaces'
import { notificationHandler } from './notificationHandler'

export const chatPeepHandler = {
  addPeep: async (
    socket: Socket,
    data: any,
    ctx: addPeepDTO,
    next: IoNextFn
  ) => {
    try {
      const chatId = ctx.validIds.chatId
      const { response, internal } = await chatPeepService.addPeep(
        socket.user,
        ctx
      )
      socket.emit('newPeep', { newPeep: response })
      socket.to(`chats:${chatId}`).emit('newPeep', { newPeep: response })

      notificationHandler.notifyOpp(socket, internal)
    } catch (err) {
      console.log(err)
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
        socket.to(`chats:${chatId}`).emit('readPeeps', result)
      }
    } catch (err) {
      console.log(err)

      next(err)
    }
  },
  updateReaction: async (
    socket: Socket,
    data: any,
    ctx: updateReactionDTO,
    next: IoNextFn
  ) => {
    try {
      const chatId = ctx.validIds.chatId
      const { response, internal } = await chatPeepService.updateReaction(
        socket.user,
        ctx
      )

      socket.emit('peeps:updateReaction', response)
      socket.to(`chats:${chatId}`).emit('peeps:updateReaction', response)

      
      notificationHandler.notifyOpp(socket, internal)      
    } catch (err) {
      console.log(err)
      next(err)
    }
  },
}
