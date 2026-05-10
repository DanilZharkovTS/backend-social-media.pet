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
          opened_at,
          (
            SELECT name FROM users WHERE id = $1
          ) as sender_name,
          (
            SELECT last_read_notification_id FROM users WHERE id = $2
          ) last_read_notification_id`,
      [from, to, type, entityType, entityId]
    )
    return result.rows[0]
  },
  getAllByUserId: async (userId: number, cursor: number) => {
    const cursorCondition = cursor ? 'AND n.id < $2' : ''
    const queryValues = [userId]
    if (cursor) queryValues.push(cursor)

    const result = await pool.query(
      `SELECT
        n.id::int,
        n.sender_id::int,
        n.receiver_id::int,
        n.type,
        n.entity_type,
        n.entity_id,
        n.created_at,
        n.opened_at,
        sender.name AS sender_name,
        receiver.last_read_notification_id
      FROM notifications n
        JOIN users sender ON n.sender_id = sender.id
        JOIN users receiver ON n.receiver_id = receiver.id
      WHERE n.receiver_id = $1
      AND n.opened_at IS NULL
      ${cursorCondition}
      ORDER BY n.created_at DESC
      LIMIT 50`,
      queryValues
    )

    return result.rows
  },
  updateNotificationToOpened: async (id: number, userId: number) => {
    const result = await pool.query(
      `UPDATE notifications
      SET opened_at = NOW()
      WHERE id = $1
      AND receiver_id = $2
      RETURNING *`,
      [id, userId]
    )
    return result.rows[0]
  },
}
