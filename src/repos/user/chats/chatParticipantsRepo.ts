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
}
