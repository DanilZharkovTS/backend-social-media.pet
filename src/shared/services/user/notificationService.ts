import { no } from 'zod/v4/locales'
import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import {
  Notification,
  NotificationEntityType,
  NotificationType,
  openAllChatNotificationsDTO,
  openNotificationDTO,
} from '../../interfaces/user/notificationInterfaces'
import { User } from '../../interfaces/user/userInterfaces'
import { ApiError } from '../../lib/ApiErrors'
import { notificationsRepo } from '../../repos/user/notificationsRepo'
import { userRepo } from '../../repos/userRepo'
import { cacheService } from '../shared/cacheService'

export const notificationService = {
  createAndCount: async (
    userId: number,
    opponentId: number,
    type: NotificationType,
    entityType: NotificationEntityType,
    entityId: number,
    context?: Record<string, number>
  ) => {
    const newNotification: Notification =
      await notificationsRepo.addNotification(
        userId,
        opponentId,
        type,
        entityType,
        entityId,
        context
      )
    const newNotificationsCount = await cacheService.updateNotificationsCount(
      opponentId,
      +1
    )

    return { newNotification, newNotificationsCount }
  },
  getNotifications: async ({ userId }: TokenPayload, cursor: number) => {
    const notifications: Notification[] =
      await notificationsRepo.getAllByUserId(userId, cursor)

    const last_read_notification_id =
      notifications[0]?.last_read_notification_id

    const notificationsWithStatus = notifications.map((n) => {
      return {
        ...n,
        isRead: n.id <= last_read_notification_id ? true : false,
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
  getNotificationsCount: async ({ userId }: TokenPayload) => {
    const redisKey = `users:${userId}:notifications:count`

    const notificationsCount = await cacheService.findByKey(redisKey)

    return { newNotificationsCount: Number(notificationsCount) ?? 0 }
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
      -1
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
  openAllChatNotifications: async (
    { userId }: TokenPayload,
    { validIds: { chatId } }: openAllChatNotificationsDTO
  ) => {
    const notifications: Notification[] =
      await notificationsRepo.updateChatNotificationsToOpened(userId, chatId)

    if (notifications.length === 0) return

    const notificationIds = notifications.map((n) => n.id)

    const newNotificationsCount = await cacheService.updateNotificationsCount(
      userId,
      -notificationIds.length
    )

    return { notificationIds, newNotificationsCount, userId }
  },
}
