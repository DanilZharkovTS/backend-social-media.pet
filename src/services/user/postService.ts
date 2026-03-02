import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  addPostInterface,
  findPostDTO,
  paginationDTO,
  Post,
  updatePostDTO,
} from '../../interfaces/user/postInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { getRedis } from '../../lib/redisClient.ts'
import { postLikesRepo } from '../../repos/user/postLikesRepo.ts'
import { postRepo } from '../../repos/user/postRepo.ts'
import { cacheService } from '../shared/cacheService.ts'

export const postService = {
  //me
  add: async (data: addPostInterface, user: TokenPayload) => {
    const result = await postRepo.insert(user.userId, data.description)

    await cacheService.invalidateByPrefix('posts:search:*')

    return { created: result.rows[0] }
  },
  getAll: async (pagination: paginationDTO) => {
    const redis = getRedis()

    const redisResult = await redis.get(
      `posts:page:${pagination.page}:limit:${pagination.limit}`
    )
    if (redisResult) {
      return {
        pagination: { page: pagination.page, limit: pagination.limit },
        posts: JSON.parse(redisResult),
      }
    }
    const result = await postRepo.selectAll(pagination)
    return {
      pagination: { page: pagination.page, limit: pagination.limit },
      posts: result.rows,
    }
  },
  update: async (id: number, data: updatePostDTO, user: TokenPayload) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw ApiError('Post not found', 404)

    const userId = post.rows[0].user_id
    if (userId !== user.userId) {
      throw ApiError('You are not allowed to modify this post', 403)
    }

    const result = await postRepo.update(id, data)

    await cacheService.invalidateByPrefix('posts:search:*')

    return {
      updated: result.rows[0],
    }
  },
  delete: async (id: number, user: TokenPayload) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw ApiError('Post not found', 404)

    const userId = post.rows[0].user_id
    if (userId !== user.userId) {
      throw ApiError('You are not allowed to delete this post', 403)
    }

    const result = await postRepo.deleteById(id)

    await cacheService.invalidateByPrefix('posts:search:*')

    return { deleted: result.rows[0] }
  },
  find: async (
    user: TokenPayload,
    query: findPostDTO,
    pagination: paginationDTO
  ) => {
    const redis = getRedis()
    const search = query.search ? query.search : 'all'
    const redisKey = `posts:search:${search}:page:${pagination.page}:limit:${pagination.limit}`

    const redisResult = await redis.get(redisKey)
    if (redisResult) {
      console.log('HIT REDIS CONDITION')

      const redisPosts: Post[] = JSON.parse(redisResult)
      const postsWithLike = await postService.attachUserLikes(user, redisPosts)

      return {
        search: query.search,
        pagination: { page: pagination.page, limit: pagination.limit },
        posts: postsWithLike,
      }
    }
    console.log('HIT DB CONDITION')

    const postsResult = await postRepo.selectBySearch(query, pagination)
    const dbPosts: Post[] = postsResult.rows

    await redis.set(redisKey, JSON.stringify(dbPosts), 'EX', 60)

    const postsWithLike = await postService.attachUserLikes(user, dbPosts)
    console.log('EXIT DB CONDITION')

    return {
      search: query.search,
      pagination: { page: pagination.page, limit: pagination.limit },
      posts: postsWithLike,
    }
  },
  attachUserLikes: async (user: TokenPayload, posts: Post[]) => {
    const postsIds = posts.map((post) => post.id)

    const userPostLikesResult = await postLikesRepo.findByUserIdAndPostsIds(
      user.userId,
      postsIds
    )
    const dbUserPostLikes = userPostLikesResult.rows
    const likedPostIds = dbUserPostLikes.map((like) => like.post_id)

    const postsWithLike = posts.map((post) => {
      return { ...post, isLiked: likedPostIds.includes(post.id) }
    })

    return postsWithLike
  },
  //admin
  deleteAsAdmin: async (postId: number) => {
    const deletedPost = await postRepo.deleteById(postId)
    if (deletedPost.rows.length === 0) throw ApiError('Post not found', 404)

    await cacheService.invalidateByPrefix('posts:search:*')

    return { deleted: deletedPost.rows[0] }
  },
  //likes
  toggleLike: async (user: TokenPayload, postId: number) => {
    const redis = getRedis()

    const likeResult = await postLikesRepo.findByUserIdAndPostId(
      user.userId,
      postId
    )
    const dbLike = likeResult.rows[0]

    if (dbLike) {
      await postLikesRepo.deleteLikeById(dbLike.id)
      await postRepo.decreaseLikesCount(dbLike.post_id)
      await cacheService.invalidateByPrefix('posts:search:*')

      return { isLiked: false }
    }

    await postLikesRepo.addLike(user.userId, postId)
    await postRepo.increaseLikesCount(postId)
    await cacheService.invalidateByPrefix('posts:search:*')

    return { isLiked: true }
  },
}
