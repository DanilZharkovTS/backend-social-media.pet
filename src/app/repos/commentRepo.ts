import type { paginationDTO } from 'interfaces/postInterfaces.ts'
import pool from '../pool.ts'

export const commentRepo = {
  insert: (content: string, userId: number, postId: number) => {
    return pool.query(
      `INSERT INTO comments (content, user_id, post_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [content, userId, postId]
    )
  },
  selectAll: (postId: number, pagination: paginationDTO) => {
    return pool.query(
      `SELECT comments.id, comments.post_id, comments.user_id, comments.content,  users.name  
        FROM comments
        JOIN users ON comments.user_id = users.id
        WHERE comments.post_id = $1
        LIMIT $2 OFFSET $3`,
      [postId, pagination.limit, pagination.offset]
    )
  },
  selectById: (commentId: number) => {
    return pool.query(
      `SELECT users.name
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = $1`,
      [commentId]
    )
  },
  deleteById: (commentId: number) => {
    return pool.query(
      `DELETE FROM comments
      WHERE id = $1
      RETURNING *`,
      [commentId]
    )
  },
}
