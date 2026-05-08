import { TokenPayload } from '../../interfaces/auth/authInterfaces'
import { Notification } from '../../interfaces/user/notificationInterfaces'
import { User } from '../../interfaces/user/userInterfaces'
import { notificationsRepo } from '../../repos/user/notificationsRepo'
import { userRepo } from '../../repos/userRepo'

export const notificationService = {
  getNotifications: async ({ userId }: TokenPayload, cursor: number) => {
    const userResult = await userRepo.findUserById(userId)
    const {last_notification_read_at}: User = userResult.rows[0]

    const dbNotifications: Notification[] =
      await notificationsRepo.getAllByUserId(userId, cursor)

    const notificationsWithStatus = dbNotifications.map((n) => {
      return {
        ...n,
        isRead: n.created_at >= last_notification_read_at ? 'read' : 'unread',
      }
    })

    const nextCursor = notificationsWithStatus.at(-1)?.id

    return {
      notifications: notificationsWithStatus,
      nextCursor
    }
  },
}
