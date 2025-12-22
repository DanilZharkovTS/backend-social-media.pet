import pool from '../pool.ts'
import type { registerUserDTO } from '../interfaces/authInterfaces.ts'
import type { dynamicUpdateMyInfo } from '../interfaces/userInterfaces.ts'
import type { paginationDTO } from '../interfaces/postInterfaces.ts'

export const userRepo = {
  createUser: (data: registerUserDTO) => {
    return pool.query(
      `INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING users.id, users.email, users.name, users.created_at`,
      [data.email, data.password, data.name]
    )
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
      `SELECT id, role, name, email FROM users
      WHERE ($1::text IS NULL OR
      LOWER(email) LIKE LOWER($1))
      LIMIT $2 OFFSET $3`,
      [search, pagination.limit, pagination.offset]
    )
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
  deleteUserById: (userId: number) => {
    return pool.query(
      `DELETE FROM users
      WHERE id = $1
      RETURNING *`,
      [userId]
    )
  },
}
