import type { Server, Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'
import { chatHandler } from '../handlers/chatHandler'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'
import { ioChatMiddlewares } from '../middlewares/chat/chatMiddlewares'

export const registerChatEvents = (io: Server, socket: Socket) => {
  socket.on(
    'joinChat',
    withMiddlewares(socket, [resolveIds(['chatId'])], chatHandler.joinChatRoom)
  )
  socket.on(
    'leaveChat',
    withMiddlewares(
      socket,
      [resolveIds(['chatId']), ioChatMiddlewares.requireRoomMember],
      chatHandler.leaveChatRoom
    )
  )
}
