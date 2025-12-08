import pool from '../pool.ts'
import type { registerUserDTO } from '../interfaces/authInterfaces.ts'
import type { dynamicUpdateMyInfo } from '../interfaces/userInterfaces.ts'

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
  updateMyInfoById: (userId: number, data: dynamicUpdateMyInfo) => {
    return pool.query(
      `UPDATE users
      SET ${data.fields.join(', ')}
      WHERE id = $1
      RETURNING *`,
      [userId, ...data.values]
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
}
