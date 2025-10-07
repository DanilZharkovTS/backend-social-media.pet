import pool from '../pool.ts'
import type { addPostInterface } from '../interfaces/postInterfaces.ts'

export const postRepo = {
  insert: (id: number, description: string) => {
    return pool.query(
      `INSERT INTO posts (user_id, description)
        VALUES ($1, $2)
        RETURNING *`,
      [id, description]
    )
  },
}
