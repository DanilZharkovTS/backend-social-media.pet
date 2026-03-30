import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import pool from '../../../pool'

export const chatPeepsRepo = {
  addPeep: (senderId: number, chatId: number, content: string) => {
    return pool.query(
      `INSERT INTO chat_peeps (sender_id, chat_id, content)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [senderId, chatId, content]
    )
  },
  findById: (peepId: number) => {
    return pool.query(
      `SELECT * FROM chat_peeps
      WHERE id = $1`,
      [peepId]
    )
  },
  findByContent: (content: string, chatId: number, p: paginationDTO) => {
    return pool.query(
      `SELECT cp.id, cp.sender_id, cp.content, cp.created_at, cp.is_edited, u.name, u.avatar_url, u.has_checkmark FROM chat_peeps cp
      JOIN users u ON cp.sender_id = u.id
      WHERE ($1::text IS NULL OR
      LOWER(content) LIKE LOWER($1))
      AND cp.chat_id = $2
      ORDER BY cp.created_at
      LIMIT $3 OFFSET $4 `,
      [content, chatId, p.limit, p.offset]
    )
  },
  updatePeep: (content: string, peepId: number) => {
    return pool.query(
      `UPDATE chat_peeps 
      SET content = $1, is_edited = true
      WHERE id = $2
      RETURNING *`,
      [content, peepId]
    )
  },
  deleteById: (peepId: number) => {
    return pool.query(
      `DELETE FROM chat_peeps
      WHERE id = $1
      RETURNING *`,
      [peepId]
    )
  },
}
