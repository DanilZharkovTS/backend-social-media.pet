import type { ChatType } from '../../../interfaces/user/chatInterfaces'
import pool from '../../../pool'

export const chatRepo = {
  createChat: (type: ChatType, name?: string | null) => {
    return pool.query(
      `INSERT INTO chats (type, name)
      VALUES ($1, $2)
      RETURNING *`,
      [type, name]
    )
  },
  findByUserIds: (userIds: number[]) => {
    return pool.query(
      `SELECT c.id, c.type, c.name, c.created_at, c.updated_at FROM chats c
      JOIN chat_participants cp1 ON c.id = cp1.chat_id
      AND cp1.user_id = $1
      JOIN chat_participants cp2 ON c.id = cp2.chat_id
      AND cp2.user_id = $2
      WHERE type = 'private'`,
      userIds
    )
  },
  findByUserId: (userId: number) => {
    return pool.query(
      `SELECT c.id, c.type, c.name, c.created_at, c.updated_at FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id
      WHERE cp.user_id = $1`,
      [userId]
    )
  },
}
