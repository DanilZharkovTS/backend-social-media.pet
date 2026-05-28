import pool from '../../pool.ts'
import type {
  AuthProvider,
  providerUserDTO,
  registerUserDTO,
} from '../interfaces/auth/authInterfaces.ts'
import type { dynamicUpdateMyInfo } from '../interfaces/user/userInterfaces.ts'
import type { paginationDTO } from '../interfaces/user/postInterfaces.ts'

export const userRepo = {
  createUser: (data: registerUserDTO) => {
    return pool.query(
      `INSERT INTO users (email, password, name, primary_provider)
      VALUES ($1, $2, $3, $4)
      RETURNING users.id, users.email, users.name, users.created_at`,
      [data.email, data.password, data.name, data.primary_provider]
    )
  },

  createVerifiedUser: async (data: providerUserDTO) => {
    const result = await pool.query(
      `INSERT INTO users (email, name, email_is_verified, avatar_url, primary_provider)
      VALUES ($1, $2, true, $3, $4)
      RETURNING users.id, users.email, users.name, users.primary_provider, users.created_at`,
      [data.email, data.name, data.avatar_url, data.primary_provider]
    )
    return result.rows[0]
  },

  findUserById: (userId: number) => {
    return pool.query(
      `SELECT * FROM users
      WHERE id = $1`,
      [userId]
    )
  },
  findByEmail: (email: string) => {
    return pool.query(
      `SELECT * FROM users
      WHERE email = $1`,
      [email]
    )
  },
  findBySearch: (search: string, pagination: paginationDTO) => {
    return pool.query(
      `SELECT id, role, name, email, email_is_verified FROM users
      WHERE ($1::text IS NULL OR
      LOWER(email) LIKE LOWER($1))
      LIMIT $2 OFFSET $3`,
      [search, pagination.limit, pagination.offset]
    )
  },
  findByEmailWithProvider: async (email: string, provider: AuthProvider) => {
    const result = await pool.query(
      `SELECT u.id, u.email, u.name, u.primary_provider, up.provider, up.provider_user_id FROM users u
      LEFT JOIN user_providers up ON u.id = up.user_id AND up.provider = $2
      WHERE u.email = $1`,
      [email, provider]
    )
    return result.rows[0]
  },
  updateIsVerified: (value: boolean, userId: number) => {
    return pool.query(
      `UPDATE users
      SET email_is_verified = $1
      WHERE id = $2
      RETURNING *`,
      [value, userId]
    )
  },
  updateCheckmarkById: (value: boolean, userId: number) => {
    return pool.query(
      `UPDATE users 
      SET has_checkmark = $1
      WHERE id = $2`,
      [value, userId]
    )
  },
  updateMyInfoById: (userId: number, data: dynamicUpdateMyInfo) => {
    return pool.query(
      `UPDATE users
      SET ${data.fields.join(', ')}
      WHERE id = $1
      RETURNING *`,
      [userId, ...data.values]
    )
  },
  updateMyEmailById: (userId: number, newEmail: string) => {
    return pool.query(
      `UPDATE users
      SET email = $2
      WHERE id = $1
      RETURNING *`,
      [userId, newEmail]
    )
  },
  updateMyPasswordById: (userId: number, newPassword: string) => {
    return pool.query(
      `UPDATE users 
      SET password = $2
      WHERE id = $1
      RETURNING *`,
      [userId, newPassword]
    )
  },
  updateMyAvatarById: (avatarUrl: string, userId: number) => {
    return pool.query(
      `UPDATE users
      SET avatar_url = $1
      WHERE id = $2
      RETURNING avatar_url`,
      [avatarUrl, userId]
    )
  },
  updateStripeCustomerIdById: (stripeCustomerId: string, userId: number) => {
    return pool.query(
      `UPDATE users
      SET stripe_customer_id = $1
      WHERE id = $2
      RETURNING *`,
      [stripeCustomerId, userId]
    )
  },
  updateLastReadNotificationId: async (
    userId: number,
    notificationId: number
  ) => {
    const result = await pool.query(
      `UPDATE users
        SET last_read_notification_id = $2
      WHERE id = $1
      AND last_read_notification_id < $2
      RETURNING *`,
      [userId, notificationId]
    )
    return result.rows[0]
  },
  deleteUserById: (userId: number) => {
    return pool.query(
      `DELETE FROM users
      WHERE id = $1
      RETURNING *`,
      [userId]
    )
  },
}
