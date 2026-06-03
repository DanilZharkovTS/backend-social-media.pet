import pool from '../../pool.ts'
import type {
  actionTokenType,
  SessionType,
} from '../interfaces/auth/authInterfaces.ts'

export const authRepo = {
  insertRefreshToken: (
    userId: number,
    sessionId: number,
    token: string,
    expiresAt: Date
  ) => {
    return pool.query(
      `INSERT INTO refresh_tokens (user_id, session_id, token, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [userId, sessionId, token, expiresAt]
    )
  },
  selectRefreshWithUserAndSessionByToken: (token: string) => {
    return pool.query(
      `SELECT rf.user_id, rf.session_id, rf.expires_at AS refresh_expires_at, rf.id, rf.revoked AS refresh_revoked, s.expires_at AS session_expires_at, s.revoked_at AS session_revoked_at, s.type AS session_type, rf.token, u.email, u.role
       FROM refresh_tokens rf
       JOIN sessions s ON rf.session_id = s.id
       JOIN users u ON rf.user_id = u.id
       WHERE rf.token = $1`,
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
  revokeValidRefreshBySessionId: async (sessionId: number) => {
    const result = await pool.query(
      `UPDATE refresh_tokens
      SET revoked = true
      WHERE session_id = $1
      AND revoked = false
      AND expires_at > NOW()`,
      [sessionId]
    )
    return result.rows
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
    type: actionTokenType,
    payload?: any
  ) => {
    return pool.query(
      `INSERT INTO action_tokens (user_id, token_hash, expires_at, type, payload)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [userId, tokenHash, expiresAt, type, JSON.stringify(payload) || null]
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
  insertSession: async (userId: number, type: SessionType, expiresAt: Date) => {
    const result = await pool.query(
      `INSERT INTO sessions (user_id, type, expires_at)
      VALUES ($1, $2, $3)
      RETURNING *`,
      [userId, type, expiresAt]
    )
    return result.rows[0]
  },
  findActiveSessionsByUserId: async (userId: number) => {
    const result = await pool.query(
      `SELECT * FROM sessions
      WHERE user_id = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
      LIMIT 100`,
      [userId]
    )
    return result.rows
  },
  findSessionById: async (sessionId: number) => {
    const result = await pool.query(
      `SELECT * FROM sessions
      WHERE id = $1`,
      [sessionId]
    )
    return result.rows[0]
  },

  revokeSession: async (sessionId: number) => {
    const result = await pool.query(
      `UPDATE sessions
      SET revoked_at = NOW()
      WHERE id = $1
      AND revoked_at IS NULL
      RETURNING *`,
      [sessionId]
    )
    return result.rows[0]
  },
  updateSessionExpiry: async (sessionId: number, expiresAt: Date) => {
    const result = await pool.query(
      `UPDATE sessions
      SET expires_at = $1
      WHERE id = $2
      RETURNING *`,
      [expiresAt, sessionId]
    )
    return result.rows[0]
  },
  selectActionTokenByToken: (token: string) => {
    return pool.query(
      `SELECT * FROM action_tokens
      WHERE token_hash = $1`,
      [token]
    )
  },
  findActionTokenWithUserByToken: async (token: string) => {
    const result = await pool.query(
      `SELECT at.*, u.email, u.role, u.name, u.avatar_url FROM action_tokens at
      JOIN users u ON at.user_id = u.id
      WHERE at.token_hash = $1`,
      [token]
    )
    return result.rows[0]
  },
  findValidActionTokenByUserAndType: async (
    userId: number,
    type: actionTokenType
  ) => {
    const result = await pool.query(
      `SELECT * FROM action_tokens
      WHERE user_id = $1
      AND type = $2
      AND used_at IS NULL
      AND expires_at > NOW()`,
      [userId, type]
    )
    return result.rows[0]
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
  findProvidersByUserId: async (userId: number) => {
    const result = await pool.query(
      `SELECT * FROM user_providers
      WHERE user_id = $1`,
      [userId]
    )
    return result.rows
  },
}
