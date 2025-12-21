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
  insertEmailVerificationToken: (
    userId: number,
    tokenHash: string,
    expiresAt: Date
  ) => {
    return pool.query(
      `INSERT INTO email_verification_tokens (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, tokenHash, expiresAt]
    )
  },
  selectRefreshTokenByToken: (token: string) => {
    return pool.query(
      `SELECT refresh_tokens.user_id, refresh_tokens.id, refresh_tokens.token, users.email, users.role
       FROM refresh_tokens
       JOIN users ON refresh_tokens.user_id = users.id
       WHERE refresh_tokens.token = $1`,
      [token]
    )
  },
  revokeRefreshTokenById: (tokenId: number) => {
    return pool.query(
      `UPDATE refresh_tokens
      SET revoked = false
      WHERE id = $1`,
      [tokenId]
    )
  },
}
