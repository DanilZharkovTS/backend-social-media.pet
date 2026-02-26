import type { paginationDTO } from '../interfaces/user/postInterfaces.ts'
import pool from '../pool.ts'
import type { updateCommentDTO } from '../interfaces/user/commentInterfaces.ts'

export const commentRepo = {
  insert: (content: string, postId: number, userId: number) => {
    return pool.query(
      `INSERT INTO comments (content, post_id, user_id)
        VALUES ($1, $2, $3)
        RETURNING *`,
      [content, postId, userId]
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
  updateById: (commentId: number, data: updateCommentDTO) => {
    return pool.query(
      `UPDATE comments
      SET ${data.fields.join(', ')}
      WHERE id = $1
      RETURNING *`,
      [commentId, ...data.values]
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
  selectById: (commentId: number) => {
    return pool.query(
      `SELECT * FROM comments
      WHERE id = $1`,
      [commentId]
    )
  },
}
