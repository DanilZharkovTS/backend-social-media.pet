import type { ChatType } from '../../../interfaces/user/chat/chatInterfaces'
import { paginationDTO } from '../../../interfaces/user/postInterfaces'
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
  findById: (chatId: number) => {
    return pool.query(
      `SELECT * FROM chats
      WHERE id = $1`,
      [chatId]
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
  findByUserId: (userId: number, p: paginationDTO) => {
    return pool.query(
      `SELECT c.id, c.type, c.created_at, c.updated_at, u.id AS user_id, u.name, u.avatar_url
        FROM chats c
        JOIN chat_participants cp1 ON c.id = cp1.chat_id AND cp1.user_id = $1
        JOIN chat_participants cp2 ON c.id = cp2.chat_id AND cp2.user_id != $1
        JOIN users u ON cp2.user_id = u.id
        LIMIT $2 OFFSET $3`,
      [userId, p.limit, p.offset]
    )
  },
  findByIdAndUserId: (chatId: number, userId: number) => {
    return pool.query(
      `SELECT c.id, c.type, c.created_at, c.updated_at, u.name, u.id AS user_id, u.avatar_url
      FROM chats c
      JOIN chat_participants cp ON c.id = cp.chat_id AND cp.user_id != $2
      JOIN users u ON cp.user_id = u.id
      WHERE c.id = $1`,
      [chatId, userId]
    )
  },
  deleteById: (chatId: number) => {
    return pool.query(
      `DELETE FROM chats
      WHERE id = $1
      RETURNING *`,
      [chatId]
    )
  },
}
