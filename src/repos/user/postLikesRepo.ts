import pool from '../../pool'

export const postLikesRepo = {
  addLike: (userId: number, postId: number) => {
    return pool.query(
      `INSERT into post_likes (user_id, post_id)
  VALUES ($1, $2)`,
      [userId, postId]
    )
  },
  findByUserIdAndPostId: (userId: number, postId: number) => {
    return pool.query(
      `SELECT * FROM post_likes
      WHERE user_id = $1
      AND post_id = $2
      `,
      [userId, postId]
    )
  },
  deleteLikeById: (likeId: number) => {
    return pool.query(
      `DELETE FROM post_likes 
      WHERE id = $1`,
      [likeId]
    )
  },
}
