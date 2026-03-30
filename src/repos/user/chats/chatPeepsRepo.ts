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
  updatePeep: (content: string, peepId: number) => {
    return pool.query(
      `UPDATE chat_peeps 
      SET content = $1, is_edited = true
      WHERE id = $2
      RETURNING *`,
      [content, peepId]
    )
  },
}
