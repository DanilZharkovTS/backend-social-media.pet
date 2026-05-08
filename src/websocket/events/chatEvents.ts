import type { Server, Socket } from 'socket.io'
import { chatHandler } from '../handlers/chatHandler'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { ioChatMiddlewares } from '../middlewares/user/chatMiddlewares'
import { chatPeepHandler } from '../handlers/chatPeepHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'

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
    'peep:updateReaction',
    withMiddlewares(
      socket,
      [
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
      [resolveIds(['peepId'])],
      chatPeepHandler.deletePeep
    )
  )

  socket.on(
    'readPeeps',
    withMiddlewares(
      socket,
      [resolveIds(['chatId', 'peepId'])],
      chatPeepHandler.markPeepsAsReadUpTo
    )
  )
}
