import type { Server, Socket } from 'socket.io'
import { chatHandler } from '../handlers/chatHandler'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { ioChatMiddlewares } from '../middlewares/user/chatMiddlewares'
import { chatPeepHandler } from '../handlers/chatPeepHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'
import { ioRateLimiter } from '../middlewares/helpers/rateLimiter'

export const registerChatEvents = async (io: Server, socket: Socket) => {
  chatHandler.notifyOnlineOpponents(socket)

  socket.on(
    'joinChat',
    withMiddlewares(socket, [resolveIds(['chatId'])], chatHandler.joinChatRoom)
  )

  socket.on(
    'leaveChat',
    withMiddlewares(
      socket,
      [
        resolveIds(['chatId']),
        ioAuthMiddlewares.requireRoomMember('chats', 'chatId'),
      ],
      chatHandler.leaveChatRoom
    )
  )

  socket.on(
    'typing',
    withMiddlewares(socket, [resolveIds(['chatId'])], chatHandler.typing)
  )

  socket.on(
    'stopTyping',
    withMiddlewares(socket, [resolveIds(['chatId'])], chatHandler.stopTyping)
  )

  socket.on(
    'chat:setChatAutoDelete',
    withMiddlewares(
      socket,
      [
        ioRateLimiter(10, 60, 'set_chat_auto_delete'),
        resolveIds(['chatId']),
        ioAuthMiddlewares.requireRoomMember('chats', 'chatId'),
        ioChatMiddlewares.setChatAutoDeletePeeps,
      ],
      chatHandler.setAutoDeletePeeps
    )
  )

  //peeps

  socket.on(
    'addPeep',
    withMiddlewares(
      socket,
      [
        ioRateLimiter(30, 60, 'add_peep'),
        resolveIds(['chatId']),
        ioAuthMiddlewares.requireRoomMember('chats', 'chatId'),
        ioChatMiddlewares.addPeep,
      ],
      chatPeepHandler.addPeep
    )
  )

  socket.on(
    'editPeep',
    withMiddlewares(
      socket,
      [
        ioRateLimiter(20, 60, 'edit_peep'),
        resolveIds(['peepId']),
        ioChatMiddlewares.editPeep,
      ],
      chatPeepHandler.editPeep
    )
  )

  socket.on(
    'peep:updateReaction',
    withMiddlewares(
      socket,
      [
        ioRateLimiter(60, 60, 'update_reaction'),
        resolveIds(['chatId', 'peepId']),
        ioAuthMiddlewares.requireRoomMember('chats', 'chatId'),
        ioChatMiddlewares.updateReaction,
      ],
      chatPeepHandler.updateReaction
    )
  )

  socket.on(
    'deletePeep',
    withMiddlewares(
      socket,
      [ioRateLimiter(20, 60, 'delete_peep'), resolveIds(['peepId'])],
      chatPeepHandler.deletePeep
    )
  )

  socket.on(
    'readPeeps',
    withMiddlewares(
      socket,
      [ioRateLimiter(100, 60, 'read_peeps'), resolveIds(['chatId', 'peepId'])],
      chatPeepHandler.markPeepsAsReadUpTo
    )
  )
}
