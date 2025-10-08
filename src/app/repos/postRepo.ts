import pool from '../pool.ts'
import type { addPostInterface, paginationDTO } from '../interfaces/postInterfaces.ts'

export const postRepo = {
  insert: (id: number, description: string) => {
    return pool.query(
      `INSERT INTO posts (user_id, description)
        VALUES ($1, $2)
        RETURNING *`,
      [id, description]
    )
  },
  selectAll: (pagination: paginationDTO) => {
    return pool.query(
      `SELECT posts.id, posts.description, users.name FROM posts
       JOIN users ON users.id = posts.user_id
       LIMIT $1 OFFSET $2`,
      [pagination.limit, pagination.offset]
    )
  },
}
