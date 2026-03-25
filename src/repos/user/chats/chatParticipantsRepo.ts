import pool from '../../../pool'

export const chatParticipantsRepo = {
  addParticipant: (chatId: number, userId: number) => {
    return pool.query(
      `INSERT INTO chat_participants (chat_id, user_id)
      VALUES ($1, $2)
      RETURNING *`,
      [chatId, userId]
    )
  },
  findByChatIdAndUserId: (chatId: number, userId: number) => {
    return pool.query(
      `SELECT FROM chat_participants
      WHERE chat_id = $1
      AND user_id = $2`,
      [chatId, userId]
    )
  },
}
