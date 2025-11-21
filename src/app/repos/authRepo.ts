import type { registerUserDTO } from 'interfaces/authInterfaces.ts'
import pool from '../pool.ts'

export const authRepo = {
  createUser: (data: registerUserDTO) => {
    return pool.query(
      `INSERT INTO users (email, password, name)
      VALUES ($1, $2, $3)
      RETURNING users.id, users.email, users.name, users.created_at`,
      [data.email, data.password, data.name]
    )
  },
}
