import type { Server, Socket } from 'socket.io'
import { chatService } from '../../services/user/chat/chatService'
import { chatHandler } from '../handlers/chatHandler'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'
import { ioChatMiddlewares } from '../middlewares/user/chatMiddlewares'
import { chatPeepHandler } from '../handlers/chatPeepHandler'

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

  socket.on(
    'typing',
    withMiddlewares(socket, [resolveIds(['chatId'])], chatHandler.typing)
  )

  //peeps

  socket.on(
    'addPeep',
    withMiddlewares(
      socket,
      [resolveIds(['chatId']), ioChatMiddlewares.addPeep],
      chatPeepHandler.addPeep
    )
  )

  socket.on(
    'editPeep',
    withMiddlewares(
      socket,
      [resolveIds(['peepId']), ioChatMiddlewares.editPeep],
      chatPeepHandler.editPeep
    )
  )

  socket.on(
    'deletePeep',
    withMiddlewares(
      socket,
      [resolveIds(['peepId'])],
      chatPeepHandler.deletePeep
    )
  )
}
