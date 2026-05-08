import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import {
  Notification,
  openNotificationDTO,
} from '../../interfaces/user/notificationInterfaces'
import { ApiError } from '../../lib/ApiErrors'
import { notificationsRepo } from '../../repos/user/notificationsRepo'

export const notificationService = {
  getNotifications: async ({ userId }: TokenPayload, cursor: number) => {
    const notifications: Notification[] =
      await notificationsRepo.getAllByUserId(userId, cursor)

    const last_notification_read_at =
      notifications[0]?.last_notification_read_at

    const notificationsWithStatus = notifications.map((n) => {
      return {
        ...n,
        isRead: last_notification_read_at
          ? n.created_at >= last_notification_read_at
            ? 'read'
            : 'unread'
          : 'uread',
      }
    })

    const nextCursor = notificationsWithStatus.at(-1)?.id

    return {
      notifications: notificationsWithStatus,
      nextCursor,
    }
  },
  openNotification: async (
    { userId }: TokenPayload,
    { validIds: { notificationId } }: openNotificationDTO
  ) => {
    const notification: Notification =
      await notificationsRepo.updateNotificationToOpened(notificationId, userId)

    if (!notification) {
      throw ApiError('Notification not found', 404)
    }

    return notification
  },
}
