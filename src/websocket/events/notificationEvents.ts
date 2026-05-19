import { Socket } from 'socket.io'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { notificationHandler } from '../handlers/notificationHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'

export const registerNotificationEvents = (socket: Socket) => {
  socket.on(
    'notifications:count',
    withMiddlewares(socket, [], notificationHandler.getNotificationsCount)
  )
  socket.on(
    'notifications:open',
    withMiddlewares(
      socket,
      [resolveIds(['notificationId'])],
      notificationHandler.openNotification
    )
  )

  socket.on(
    'chat:notifications:open_all',
    withMiddlewares(
      socket,
      [
        resolveIds(['chatId']),
        ioAuthMiddlewares.requireRoomMember('chats', 'chatId'),
      ],
      notificationHandler.openAllChatNotifications
    )
  )

  socket.on(
    'notifications:readUpTo',
    withMiddlewares(
      socket,
      [resolveIds(['lastReadNotificationId'])],
      notificationHandler.readNotificationUpTo
    )
  )
}
