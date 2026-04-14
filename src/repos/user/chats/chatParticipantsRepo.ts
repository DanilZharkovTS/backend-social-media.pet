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
      `SELECT * FROM chat_participants
      WHERE chat_id = $1
      AND user_id = $2`,
      [chatId, userId]
    )
  },
  findOpponentByChatId: (chatId: number, userId: number) => {
    return pool.query(
      `SELECT * FROM chat_participants 
      WHERE chat_id = $1
      AND user_id != $2`,
      [chatId, userId]
    )
  },
  updateLastReadPeep: (peepId: number, userId: number, chatId: number) => {
    return pool.query(
      `UPDATE chat_participants 
      SET last_read_peep_id = $1
      WHERE user_id = $2
        AND chat_id = $3
        AND EXISTS (
          SELECT 1 FROM chat_peeps cp
            WHERE cp.id = $1
              AND cp.chat_id = $3
        )
      RETURNING last_read_peep_id`,
      [peepId, userId, chatId]
    )
  },
}
