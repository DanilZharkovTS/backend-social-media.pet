import pool from '../../../pool'
import { postMediaType } from '../../interfaces/user/postInterfaces'

export const postMediaRepo = {
  addMediaToPost: async (
    postId: number,
    type: postMediaType,
    url: string,
    position: number
  ) => {
    const result = await pool.query(
      `INSERT INTO post_media (post_id, type, url, position)
      VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [postId, type, url, position]
    )
    return result.rows[0]
  },
  findByPostId: async (postId: number) => {
    const result = await pool.query(
      `SELECT * FROM post_media
       WHERE post_id = $1
       ORDER BY position ASC`,
      [postId]
    )
    return result.rows
  },
  findWithPostById: async (mediaId: number) => {
    const result = await pool.query(
      `SELECT pm.*, p.user_id FROM post_media pm
       JOIN posts p ON pm.post_id = p.id
       WHERE pm.id = $1`,
      [mediaId]
    )
    return result.rows[0]
  },
}
