import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import {
  Notification,
  openNotificationDTO,
} from '../../interfaces/user/notificationInterfaces'
import { User } from '../../interfaces/user/userInterfaces'
import { ApiError } from '../../lib/ApiErrors'
import { notificationsRepo } from '../../repos/user/notificationsRepo'
import { userRepo } from '../../repos/userRepo'
import { cacheService } from '../shared/cacheService'

export const notificationService = {
  getNotifications: async ({ userId }: TokenPayload, cursor: number) => {
    const notifications: Notification[] =
      await notificationsRepo.getAllByUserId(userId, cursor)

    const last_read_notification_id =
      notifications[0]?.last_read_notification_id

    const notificationsWithStatus = notifications.map((n) => {
      return {
        ...n,
        isRead: n.id <= last_read_notification_id ? 'read' : 'unread',
      }
    })

    const nextCursor = notificationsWithStatus.at(-1)?.id

    const hasMore = notificationsWithStatus.length === 50

    return {
      notifications: notificationsWithStatus,
      nextCursor,
      hasMore,
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

    const newNotificationsCount = await cacheService.updateNotificationsCount(
      userId,
      +1
    )

    return { notification, newNotificationsCount }
  },
  readNotificationsUpTo: async (
    { userId }: TokenPayload,
    { validIds: { lastReadNotificationId: notificationId } }
  ) => {
    const updatedUser: User = await userRepo.updateLastReadNotificationId(
      userId,
      notificationId
    )
    if (!updatedUser) return

    const lastReadNotificationId = updatedUser.last_read_notification_id
    const newNotificationsCount = await cacheService.resetNotificationsCount(
      userId
    )

    return { lastReadNotificationId, userId, newNotificationsCount }
  },
}
