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
}
