import { Socket } from 'socket.io'
import { withMiddlewares } from '../middlewares/helpers/withMiddlewares'
import { resolveIds } from '../middlewares/helpers/resolveIds'
import { notificationHandler } from '../handlers/notificationHandler'

export const registerNotificationEvents = (socket: Socket) => {
  socket.on(
    'notification:open',
    withMiddlewares(
      socket,
      [resolveIds(['notificationId'])],
      notificationHandler.openNotification
    )
  )
}
