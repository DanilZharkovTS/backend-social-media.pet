import pool from '../pool.ts'

export const authRepo = {
  insertRefreshToken: (userId: number, token: string, expiresAt: Date) => {
    return pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, token, expiresAt]
    )
  },
}
