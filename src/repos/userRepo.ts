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
  findMeById: (userId: number) => {
    return pool.query(
      `SELECT id, role, email,name, bio, birth_date, created_at, avatar_url FROM users
      WHERE id = $1`,
      [userId]
    )
  },
  findUserById: (userId: number) => {
    return pool.query(
      `SELECT id, name, bio, birth_date, created_at, avatar_url FROM users
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
}
