import { paginationDTO } from '../../../interfaces/user/postInterfaces'
import pool from '../../../../pool'

export const chatPeepsRepo = {
  addPeep: (
    senderId: number,
    chatId: number,
    content: string,
    replyTo: number | null
  ) => {
    return pool.query(
      `WITH inserted AS (
      INSERT INTO chat_peeps (sender_id, chat_id, content, reply_to)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    )
      SELECT
      i.*,
      r.id AS reply_id,
      r.content AS reply_content,
      ru.id AS reply_sender_id,
      ru.name AS reply_name
      FROM inserted i
      LEFT JOIN chat_peeps r ON i.reply_to = r.id
      LEFT JOIN users ru ON r.sender_id = ru.id
`,
      [senderId, chatId, content, replyTo]
    )
  },
  upsertReaction: async (peepId: number, userId: number, emoji: string) => {
    const result = await pool.query(
      `INSERT INTO peep_reactions (peep_id, user_id, emoji)
        VALUES ($1, $2, $3)
        ON CONFLICT (peep_id, user_id)
        DO UPDATE SET emoji = EXCLUDED.emoji
        RETURNING
          id::int,
          peep_id::int,
          user_id::int,
          emoji,
          created_at,
         (
            SELECT u.name FROM users u WHERE u.id = user_id
          ) as name,
          (
            SELECT u.avatar_url FROM users u WHERE u.id = user_id
          ) as avatar_url
      `,
      [peepId, userId, emoji]
    )
    return result.rows[0]
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
      `SELECT 
        cp.id,
        cp.sender_id,
        cp.content,
        cp.created_at,
        cp.is_edited,
        u.name,
        u.avatar_url,
        u.has_checkmark,
        r.id AS reply_id,
        r.content AS reply_content,
        ru.id AS reply_sender_id,
        ru.name AS reply_name
      FROM chat_peeps cp
      JOIN users u ON cp.sender_id = u.id

      LEFT JOIN chat_peeps r ON cp.reply_to = r.id
      LEFT JOIN users ru ON r.sender_id = ru.id

      WHERE ($1::text IS NULL OR cp.content ILIKE $1)
        AND cp.chat_id = $2

      ORDER BY cp.created_at DESC
      LIMIT $3 OFFSET $4`,
      [content, chatId, p.limit, p.offset]
    )
  },
  findReactionsByIds: (ids: number[]) => {
    return pool.query(
      `SELECT
        r.id::int,
        r.peep_id::int,
        r.user_id::int,
        r.emoji,
        r.created_at,
        u.name,
        u.avatar_url
      FROM peep_reactions r
      JOIN users u ON r.user_id = u.id
      WHERE r.peep_id = ANY($1::int[])`,
      [ids]
    )
  },
  findByIdAndUserIdWithReactions: async (peepId: number, userId: number) => {
    const result = await pool.query(
      `SELECT 
        cp.id,
        cp.sender_id,
        cp.chat_id,
        COALESCE(
            json_agg(
              json_build_object(
                'id', pr.id::int,
                'user_id', pr.user_id::int,
                'peep_id', pr.peep_id::int,
                'emoji', pr.emoji,
                'created_at', pr.created_at,
                'name', u.name,
                'avatar_url', u.avatar_url
              )
            ) FILTER (WHERE pr.id IS NOT NULL),
            '[]'
          ) AS reactions FROM chat_peeps cp
      LEFT JOIN peep_reactions pr ON cp.id = pr.peep_id
      LEFT JOIN users u ON pr.user_id = u.id
      WHERE cp.id = $1
       GROUP BY cp.id
`,
      [peepId]
    )
    return result.rows[0]
  },
  findLastPeepsByChatId: async (chatId: number, limit: number) => {
    const result = await pool.query(
      `SELECT *
      FROM chat_peeps
      WHERE chat_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
      [chatId, limit]
    )
    return result.rows
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
  updateReactionById: async (reactionId: number, emoji: string) => {
    const result = await pool.query(
      `UPDATE peep_reactions pr
        SET emoji = $2
        WHERE pr.id = $1
        RETURNING 
          pr.id::int,
          peep_id::int,
          pr.user_id::int,
          pr.emoji,
          pr.created_at,
          (
            SELECT u.name FROM users u WHERE u.id = pr.user_id
          ) as name,
          (
            SELECT u.avatar_url FROM users u WHERE u.id = pr.user_id
          ) as avatar_url`,
      [reactionId, emoji]
    )
    return result.rows[0]
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
  deleteReactionByPeepAndUserIds: (peepId: number, userId: number) => {
    return pool.query(
      `DELETE FROM peep_reactions
      WHERE peep_id = $1 AND user_id = $2`,
      [peepId, userId]
    )
  },
}
