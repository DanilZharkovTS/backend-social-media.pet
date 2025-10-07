import pool from '../pool.ts'
import type { addPostInterface } from '../interfaces/postInterfaces.ts'

export const userRepo = {
  insert: (name: string) => {
    return pool.query(
      `INSERT INTO users (name)
        VALUES ($1)
        RETURNING *`,
      [name]
    )
  },
}
