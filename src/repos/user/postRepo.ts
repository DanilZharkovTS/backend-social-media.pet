import pool from '../../pool.ts'
import type {
  addPostInterface,
  findPostDTO,
  paginationDTO,
  updatePostDTO,
} from '../../interfaces/user/postInterfaces.ts'

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
  update: (id: number, data: updatePostDTO) => {
    return pool.query(
      `UPDATE posts
       SET ${data.fields.join(', ')}
       WHERE id = $1
       RETURNING *`,
      [id, ...data.values]
    )
  },
  findById: (id: number) => {
    return pool.query(
      `SELECT posts.id, posts.user_id, posts.description, users.name
     FROM posts
     JOIN users ON posts.user_id = users.id
     WHERE posts.id = $1`,
      [id]
    )
  },
  deleteById: (id: number) => {
    return pool.query(
      `DELETE FROM posts
       WHERE id = $1
       RETURNING *`,
      [id]
    )
  },
  selectBySearch: (query: findPostDTO, pagination: paginationDTO) => {
    return pool.query(
      `SELECT posts.id, posts.user_id, posts.description, posts.created_at, users.name FROM posts
       JOIN users ON posts.user_id = users.id
       WHERE ($1::text IS NULL OR
       LOWER(description) LIKE LOWER($1))
       LIMIT $2 OFFSET $3`,
      [query.search, pagination.limit, pagination.offset]
    )
  },
}
