import { Socket } from 'socket.io'
import { IoNextFn } from '../../../interfaces/global/socket'

export const ioChatMiddlewares = {
  requireRoomMember: (socket: Socket, data: any, next: IoNextFn) => {
    const chatId = data.validIds.chatId
    console.log(chatId);
    console.log(socket.rooms);
    

    if (!socket.rooms.has(`chats:${chatId}`)) {
      throw new Error('You are not in this chat')
    }

    next()
  },
}
