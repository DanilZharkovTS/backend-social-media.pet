import pool from '../pool.ts'
import type { addPostInterface } from '../interfaces/postInterfaces.ts'
import type { registerUserDTO } from '../interfaces/authInterfaces.ts'

export const userRepo = {
  insert: (name: string) => {
    return pool.query(
      `INSERT INTO users (name)
        VALUES ($1)
        RETURNING *`,
      [name]
    )
  },
  createUser: (data: registerUserDTO) => {
    return pool.query(
      `INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING users.id, users.email, users.name, users.created_at`,
      [data.email, data.password, data.name]
    )
  },
  findByEmail: (email: string) => {
    return pool.query(
      `SELECT * FROM users
       WHERE email = $1`,
      [email]
    )
  },
}
