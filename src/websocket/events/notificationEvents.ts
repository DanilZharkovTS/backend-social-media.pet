import { Socket } from 'socket.io'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { notificationHandler } from '../handlers/notificationHandler'
import { ioAuthMiddlewares } from '../middlewares/authMiddlewares'
import { ioRateLimiter } from '../middlewares/helpers/rateLimiter'

export const registerNotificationEvents = (socket: Socket) => {
  socket.on(
    'notifications:count',
    withMiddlewares(socket, [ioRateLimiter(30, 60, 'notifications_count')], notificationHandler.getNotificationsCount)
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
        ioRateLimiter(30, 60, 'chat_notifications_open_all'),
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
