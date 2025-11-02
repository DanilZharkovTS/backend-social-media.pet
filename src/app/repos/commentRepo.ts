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
}
