import pool from '../../../pool'
import {
  NotificationEntityType,
  NotificationType,
} from '../../interfaces/user/notificationInterfaces'

export const notificationsRepo = {
  addNotification: async (
    from: number,
    to: number,
    type: NotificationType,
    entityType: NotificationEntityType,
    entityId: number
  ) => {
    const result = await pool.query(
      `INSERT INTO notifications (sender_id, receiver_id, type, entity_type, entity_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING
          id::int,
          sender_id::int,
          receiver_id::int,
          type,
          entity_type,
          entity_id,
          created_at,
          (
            SELECT u.name FROM users u WHERE id = $1
          ) as sender_name`,
      [from, to, type, entityType, entityId]
    )
    return result.rows[0]
  },
}
