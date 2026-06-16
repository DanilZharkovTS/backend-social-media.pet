import type { paginationDTO } from '../../interfaces/user/postInterfaces.ts'
import pool from '../../../pool.ts'
import type { updateCommentDTO } from '../../interfaces/user/commentInterfaces.ts'

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
      `SELECT c.id, c.post_id, c.user_id, c.content, u.name, u.avatar_url, u.has_checkmark  
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.post_id = $1
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
