import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { Notification } from '../../interfaces/user/notificationInterfaces'
import { User } from '../../interfaces/user/userInterfaces'
import { notificationsRepo } from '../../repos/user/notificationsRepo'
import { userRepo } from '../../repos/userRepo'

export const notificationService = {
  getNotifications: async ({ userId }: TokenPayload, cursor: number) => {
    const notifications: Notification[] =
      await notificationsRepo.getAllByUserId(userId, cursor)

    const last_notification_read_at =
      notifications[0]?.last_notification_read_at
    console.log(last_notification_read_at)

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
}
