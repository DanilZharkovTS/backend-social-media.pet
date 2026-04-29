import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import pool from '../../../../pool'

export const chatPeepsRepo = {
  addPeep: (senderId: number, chatId: number, content: string) => {
    return pool.query(
      `INSERT INTO chat_peeps (sender_id, chat_id, content)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [senderId, chatId, content]
    )
  },
  addReaction: (peepId: number, userId: number, emoji: string) => {
    return pool.query(
      `INSERT INTO peep_reactions (peep_id, user_id, emoji)
      VALUES ($1, $2, $3)
      RETURNING id, peep_id, emoji
      `,
      [peepId, userId, emoji]
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
      ORDER BY cp.created_at DESC
      LIMIT $3 OFFSET $4 `,
      [content, chatId, p.limit, p.offset]
    )
  },
  findByIdAndUserIdWithReactions: (peepId: number, userId: number) => {
    return pool.query(
      `SELECT cp.id AS chat_id, pr.id AS reaction_id, pr.user_id, pr.emoji FROM chat_peeps cp
      LEFT JOIN peep_reactions pr ON cp.id = pr.peep_id
      AND pr.user_id = $2
      WHERE cp.id = $1`,
      [peepId, userId]
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
  deleteExpiredPeeps: () => {
    return pool.query(`
      DELETE FROM chat_peeps cp
      USING chats c
      WHERE cp.chat_id = c.id
        AND c.auto_delete_after IS NOT NULL
        AND cp.created_at < NOW() - c.auto_delete_after::INTERVAL
        AND cp.created_at > c.auto_delete_enabled_at
      RETURNING cp.id, cp.chat_id
      `)
  },
  deleteReactionById: (reactionId: number) => {
    return pool.query(
      `DELETE FROM peep_reactions pr
      WHERE id = $1
      RETURNING pr.id, pr.peep_id`,
      [reactionId]
    )
  },
}
