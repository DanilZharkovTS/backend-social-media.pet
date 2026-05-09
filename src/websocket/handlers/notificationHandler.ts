import { Socket } from 'socket.io'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import {
  openNotificationDTO,
  readNotificationsUpToDTO,
} from '../../shared/interfaces/user/notificationInterfaces'
import { notificationService } from '../../shared/services/user/notificationService'

export const notificationHandler = {
  openNotification: async (
    socket: Socket,
    data: any,
    ctx: openNotificationDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await notificationService.openNotification(
        socket.user,
        ctx
      )
      const { notification } = result

      socket
        .to(`users:${notification.receiver_id}`)
        .emit('notifications:opened', result)
      socket.emit('notifications:opened', result)
    } catch (err) {
      next(err)
    }
  },
  readNotificationUpTo: async (
    socket: Socket,
    data: any,
    ctx: readNotificationsUpToDTO,
    next: IoNextFn
  ) => {
    try {
      const result = await notificationService.readNotificationsUpTo(
        socket.user,
        ctx
      )

      if (result) {
        const { lastReadNotificationId, userId, newNotificationsCount } = result

        socket.emit('notifications:readUpToSuccess', {
          lastReadNotificationId,
          newNotificationsCount,
        })
        socket.to(`user:${userId}`).emit('notifications:readUpToSuccess', {
          lastReadNotificationId,
          newNotificationsCount,
        })
      }
    } catch (err) {
      next(err)
    }
  },
}
