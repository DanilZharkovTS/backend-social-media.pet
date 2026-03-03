import pool from '../../pool'

export const postFavoritiesRepo = {
  addFavorite: (userId: number, postId: number) => {
    return pool.query(
      `INSERT INTO post_favorities (user_id, post_id)
      VALUES ($1, $2)`,
      [userId, postId]
    )
  },
  findByUserIdAndPostId: (userId: number, postId: number) => {
    return pool.query(
      `SELECT * FROM post_favorities
      WHERE user_id = $1
      AND post_id = $2`,
      [userId, postId]
    )
  },
  deleteFavoriteById: (favoriteId: number) => {
    return pool.query(
      `DELETE FROM post_favorities 
      WHERE id = $1`,
      [favoriteId]
    )
  },
  findByUserIdAndPostIds: (userId: number, postIds: number[]) => {
    return pool.query(
      `SELECT * FROM post_favorities
      WHERE user_id = $1
      AND post_id = ANY($2)`,
      [userId, postIds]
    )
  },
}
