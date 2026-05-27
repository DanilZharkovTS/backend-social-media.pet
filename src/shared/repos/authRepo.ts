import pool from '../../pool.ts'
import type { actionTokenType } from '../interfaces/auth/authInterfaces.ts'

export const authRepo = {
  insertRefreshToken: (userId: number, token: string, expiresAt: Date) => {
    return pool.query(
      `INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, token, expiresAt]
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
      SET revoked = true
      WHERE id = $1`,
      [tokenId]
    )
  },
  insertTrustedDevice: (user_id: number, token: string, expires_at: Date) => {
    return pool.query(
      `INSERT INTO trusted_devices (user_id, token_hash, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [user_id, token, expires_at]
    )
  },
  selectTrustedDeviceByToken: (token: string) => {
    return pool.query(
      `SELECT * FROM trusted_devices
      WHERE token_hash = $1`,
      [token]
    )
  },
  insertActionToken: (
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    type: actionTokenType
  ) => {
    return pool.query(
      `INSERT INTO action_tokens (user_id, token_hash, expires_at, type)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, tokenHash, expiresAt, type]
    )
  },
  insertLoginEmailConfirmToken: (
    userId: number,
    token_hash: string,
    expires_at: Date,
    code_hash: string,
    type: actionTokenType
  ) => {
    return pool.query(
      `INSERT INTO action_tokens (user_id, token_hash, expires_at, payload, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [
        userId,
        token_hash,
        expires_at,
        JSON.stringify({ code: code_hash }),
        type,
      ]
    )
  },
  insertEmailChangeToken: (
    userId: number,
    tokenHash: string,
    expiresAt: Date,
    newEmail: string,
    type: actionTokenType
  ) => {
    return pool.query(
      `INSERT INTO action_tokens (user_id, token_hash, expires_at, payload, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, tokenHash, expiresAt, JSON.stringify({ newEmail }), type]
    )
  },
  insertAdminDeleteUserToken: (
    userId: number,
    token: string,
    expiresAt: Date,
    targetUserId: number,
    type: actionTokenType
  ) => {
    return pool.query(
      `INSERT INTO action_tokens (user_id, token_hash, expires_at, payload, type)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, token, expiresAt, JSON.stringify({ targetUserId }), type]
    )
  },
  selectActionTokenByToken: (token: string) => {
    return pool.query(
      `SELECT * FROM action_tokens
      WHERE token_hash = $1`,
      [token]
    )
  },
  revokeActionTokenById: (tokenId: number) => {
    return pool.query(
      `UPDATE action_tokens 
      SET used_at = NOW()
      WHERE id = $1
      RETURNING *`,
      [tokenId]
    )
  },
  insertUserProvider: async (
    userId: number,
    provider: string,
    providerId: string
  ) => {
    return pool.query(
      `INSERT INTO user_providers (user_id, provider, provider_user_id)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, provider, providerId]
    )
  },
  findProviderByProviderId: async (provider: string, providerId: string) => {
    const result = await pool.query(
      `SELECT * FROM user_providers
      WHERE provider = $1 AND provider_user_id = $2`,
      [provider, providerId]
    )
    return result.rows[0]
  },
}
