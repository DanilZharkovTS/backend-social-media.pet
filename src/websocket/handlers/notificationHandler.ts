import { Socket } from 'socket.io'
import { IoNextFn } from '../../shared/interfaces/global/socket'
import {
  internalNotificationPayload,
  openAllChatNotificationsDTO,
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
      const { notification, newNotificationsCount } =
        await notificationService.openNotification(socket.user, ctx)
      const receiver = notification.receiver_id

      socket.to(`user:${receiver}`).emit('notifications:opened', notification)
      socket.emit('notifications:opened', notification)

      socket
        .to(`user:${receiver}`)
        .emit('notifications:countUpdated', { newNotificationsCount })
      socket.emit('notifications:countUpdated', { newNotificationsCount })
    } catch (err) {
      next(err)
    }
  },
  openAllChatNotifications: async (
    socket: Socket,
    data: any,
    ctx: openAllChatNotificationsDTO,
    next: IoNextFn
  ) => {
    const result = await notificationService.openAllChatNotifications(
      socket.user,
      ctx
    )

    if (result) {
      const { notificationIds, userId, newNotificationsCount } = result

      socket
        .to(`user:${userId}`)
        .emit('notifications:opened_some', notificationIds)
      socket.emit('notifications:opened_some', notificationIds)

      socket
        .to(`user:${userId}`)
        .emit('notifications:countUpdated', { newNotificationsCount })
      socket.emit('notifications:countUpdated', { newNotificationsCount })
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
        })
        socket.to(`user:${userId}`).emit('notifications:readUpToSuccess', {
          lastReadNotificationId,
        })
        socket
          .to(`user:${userId}`)
          .emit('notifications:countUpdated', { newNotificationsCount })
        socket.emit('notifications:countUpdated', { newNotificationsCount })
      }
    } catch (err) {
      next(err)
    }
  },
  notifyOpp: (socket: Socket, internal: internalNotificationPayload) => {
    if (internal.notifyOpp && internal.notificationUpdate) {
      console.log(internal)

      const {
        notificationUpdate: { userId, newNotificationsCount, newNotification },
      } = internal

      socket.to(`user:${userId}`).emit('notifications:new', newNotification)
      socket.to(`user:${userId}`).emit('notifications:countUpdated', {
        newNotificationsCount,
      })
    }
  },
}
