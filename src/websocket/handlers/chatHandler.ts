import { Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'
import {
  joinChatRoomDTO,
  setAutoDeletePeepsDTO,
  typingDTO,
} from '../../interfaces/user/chat/chatInterfaces'
import { IoNextFn } from '../../interfaces/global/socket'
import { chatParticipantsRepo } from '../../repos/user/chats/chatParticipantsRepo'

export const chatHandler = {
  joinChatRoom: async (
    socket: Socket,
    data: any,
    ctx: joinChatRoomDTO,
    next: IoNextFn
  ) => {
    try {
      const chatId = ctx.validIds.chatId

      await chatService.joinChatRoom(socket.user, chatId)
      socket.join(`chats:${chatId}`)
      socket.emit('joinedChat', { chatId })
    } catch (err) {
      next(err)
    }
  },
  leaveChatRoom: async (socket: Socket, data: any, ctx: joinChatRoomDTO) => {
    const chatId = ctx.validIds.chatId

    socket.leave(`chats:${chatId}`)
  },
  typing: (socket: Socket, data: any, ctx: typingDTO) => {
    const { userId } = socket.user
    const { chatId } = ctx.validIds

    socket.to(`chats:${chatId}`).emit('typing', { userId })
  },
  stopTyping: (socket: Socket, data: any, ctx: typingDTO) => {
    const { userId } = socket.user
    const { chatId } = ctx.validIds

    socket.to(`chats:${chatId}`).emit('stopTyping', { userId })
  },
  setAutoDeletePeeps: async (
    socket: Socket,
    data: any,
    ctx: setAutoDeletePeepsDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await chatService.setAutoDeletePeeps(socket.user, ctx)

      if (result) {
        const { chatId, userId, interval } = result
        socket.emit('chat:autoDeleteUpdated ', { userId, interval })
        socket
          .to(`chats:${chatId}`)
          .emit('chat:autoDeleteUpdated ', { userId, interval })
        console.log('good')
      }
    } catch (err) {
      next(err)
    }
  },
  //users
  notifyOnlineOpponents: async (socket: Socket) => {
    const { ops, onlineOps, userId } = await chatService.notifyOnlineUsers(
      socket.user
    )

    socket.emit('onlineOps', { onlineOps })

    ops.forEach(({ user_id }) => {
      socket.to(`userRooms:${user_id}`).emit('onlineUser', { userId })
    })
  },
  notifyOfflineOpponents: async (socket: Socket) => {
    const { ops, userId } = await chatService.notifyOfflineUsers(socket.user)

    ops.forEach(({ user_id }) => {
      socket.to(`userRooms:${user_id}`).emit('offlineUser', { userId })
    })
  },
}
