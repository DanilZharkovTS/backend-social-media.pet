import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  addPostInterface,
  findPostDTO,
  paginationDTO,
  Post,
  PostFavorite,
  PostMedia,
  updatePostDTO,
} from '../../interfaces/user/postInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { getRedis } from '../../lib/redisClient.ts'
import { getSupabaseClient } from '../../lib/supabaseClient.ts'
import { postFavoritiesRepo } from '../../repos/user/postFavoritiesRepo.ts'
import { postLikesRepo } from '../../repos/user/postLikesRepo.ts'
import { postMediaRepo } from '../../repos/user/postMediaRepo.ts'
import { postRepo } from '../../repos/user/postRepo.ts'
import { cacheService } from '../shared/cacheService.ts'

export const postService = {
  //me
  add: async (data: addPostInterface, user: TokenPayload, files) => {
    const postResult = await postRepo.insert(user.userId, data.description)
    let dbPost = postResult.rows[0]

    if (files.length > 0) {
      dbPost = await postService.uploadAndAttachPostMedia(
        user.userId,
        dbPost,
        files
      )
    }

    await cacheService.invalidateByPrefix('posts:*')
    await cacheService.invalidateByPrefix('users:*')

    return { created: dbPost }
  },
  uploadAndAttachPostMedia: async (userId: number, post: Post, files) => {
    const supabase = getSupabaseClient()
    let updatedPost = post

    for (const [index, file] of files.entries()) {
      const fileName = `${userId}-${Date.now()}-${file.originalname
        .split('.')
        .pop()}`

      const { error: uploadError } = await supabase.storage
        .from('posts_media')
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        })

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: urlData } = supabase.storage
        .from('posts_media')
        .getPublicUrl(fileName)

      await postMediaRepo.addMediaToPost(
        post.id,
        'image',
        urlData.publicUrl,
        index
      )
      if (index === 0) {
        updatedPost = await postRepo.updateCoverUrl(post.id, urlData.publicUrl)
      }
    }
    return updatedPost
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
  getById: async (user: TokenPayload, postId: number) => {
    const redis = getRedis()
    const redisKey = `posts:${postId}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      console.log('redis')

      const redisPost = JSON.parse(redisResult)

      const postWithLike = await postService.attachUserLikes(user, [redisPost])
      const postWithFavorite = await postService.attachUserFavorities(
        user,
        postWithLike
      )

      const post = postWithFavorite[0]

      return { post }
    }
    console.log('db')

    const postResult = await postRepo.findById(postId)
    const dbPost = await postResult.rows[0]

    if (!dbPost) {
      throw ApiError('Post not found', 404)
    }

    const media = await postMediaRepo.findByPostId(postId)

    const postWithMedia = { ...dbPost, media }

    await redis.set(redisKey, JSON.stringify(postWithMedia), 'EX', 60)

    const postWithLike = await postService.attachUserLikes(user, [dbPost])
    const postWithFavorite = await postService.attachUserFavorities(
      user,
      postWithLike
    )
    const post = postWithFavorite[0]

    return { post }
  },
  update: async (id: number, data: updatePostDTO, user: TokenPayload) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw ApiError('Post not found', 404)

    const userId = post.rows[0].user_id
    if (userId !== user.userId) {
      throw ApiError('You are not allowed to modify this post', 403)
    }

    const result = await postRepo.update(id, data)

    await cacheService.invalidateByPrefix('posts:*')
    await cacheService.invalidateByPrefix('users:*')

    return {
      updated: result.rows[0],
    }
  },
  updateCoverUrl: async ({ userId }: TokenPayload, mediaId: number) => {
    const media: PostMedia = await postMediaRepo.findWithPostById(mediaId)

    if (!media) {
      throw ApiError('Post not found', 404)
    }

    if (media.user_id !== userId) {
      throw ApiError('You are not allowed to modify this post', 403)
    }

    await cacheService.invalidateByPrefix('posts:*')
    await cacheService.invalidateByPrefix('users:*')

    const post = await postRepo.updateCoverUrl(media.post_id, media.url)
    return { post }
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
    await cacheService.invalidateByPrefix('users:*')

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
      const redisPosts: Post[] = JSON.parse(redisResult)

      const postsWithLike = await postService.attachUserLikes(user, redisPosts)
      const postsWithFavorite = await postService.attachUserFavorities(
        user,
        postsWithLike
      )

      return {
        search: query.search,
        pagination: { page: pagination.page, limit: pagination.limit },
        posts: postsWithFavorite,
      }
    }

    const postsResult = await postRepo.selectBySearch(query, pagination)
    const dbPosts: Post[] = postsResult.rows

    await redis.set(redisKey, JSON.stringify(dbPosts), 'EX', 60)

    const postsWithLike = await postService.attachUserLikes(user, dbPosts)
    const postsWithFavorite = await postService.attachUserFavorities(
      user,
      postsWithLike
    )

    return {
      search: query.search,
      pagination: { page: pagination.page, limit: pagination.limit },
      posts: postsWithFavorite,
    }
  },
  attachUserLikes: async (user: TokenPayload, posts: Post[]) => {
    const postsIds = posts.map((post) => post.id)

    const userPostLikesResult = await postLikesRepo.findByUserIdAndPostsIds(
      user.userId,
      postsIds
    )
    const dbUserPostLikes = userPostLikesResult.rows
    const likedPostIds = new Set(dbUserPostLikes.map((like) => like.post_id))
    const postsWithLike = posts.map((post) => {
      return { ...post, isLiked: likedPostIds.has(post.id) }
    })

    return postsWithLike
  },
  attachUserFavorities: async (user: TokenPayload, posts: Post[]) => {
    const postIds = posts.map((p) => p.id)

    const userPostFavoritiesResult =
      await postFavoritiesRepo.findByUserIdAndPostIds(user.userId, postIds)
    const dbUserPostFavorities = userPostFavoritiesResult.rows
    const favoritePostIds = new Set(dbUserPostFavorities.map((f) => f.post_id))

    const postsWithFavorite = posts.map((p) => {
      return {
        ...p,
        isFavorite: favoritePostIds.has(p.id),
      }
    })

    return postsWithFavorite
  },
  //admin
  deleteAsAdmin: async (postId: number) => {
    const deletedPost = await postRepo.deleteById(postId)
    if (deletedPost.rows.length === 0) throw ApiError('Post not found', 404)

    await cacheService.invalidateByPrefix('posts:*')

    return { deleted: deletedPost.rows[0] }
  },
  //likes
  toggleLike: async (user: TokenPayload, postId: number) => {
    const postResult = await postRepo.findById(postId)
    const dbPost = postResult.rows[0]

    if (!dbPost) {
      throw ApiError('Post not found', 404)
    }

    const likeResult = await postLikesRepo.findByUserIdAndPostId(
      user.userId,
      postId
    )
    const dbLike = likeResult.rows[0]

    if (dbLike) {
      await postLikesRepo.deleteLikeById(dbLike.id)
      await postRepo.decreaseLikesCount(dbLike.post_id)

      await cacheService.invalidateByPrefix('posts:*')
      await cacheService.invalidateByPrefix(
        `users:${user.userId}:liked-posts:*`
      )
      await cacheService.invalidateByPrefix(
        `users:${user.userId}:favorite-posts:*`
      )
      await cacheService.invalidateByPrefix(`users:${user.userId}:posts:*`)

      return { isLiked: false }
    }

    await postLikesRepo.addLike(user.userId, postId)
    await postRepo.increaseLikesCount(postId)

    await cacheService.invalidateByPrefix('posts:*')
    await cacheService.invalidateByPrefix(`users:${user.userId}:liked-posts:*`)
    await cacheService.invalidateByPrefix(
      `users:${user.userId}:favorite-posts:*`
    )
    await cacheService.invalidateByPrefix(`users:${user.userId}:posts:*`)

    return { isLiked: true }
  },
  toggleFavorite: async (user: TokenPayload, postId: number) => {
    const postResult = await postRepo.findById(postId)
    const dbPost = postResult.rows[0]

    if (!dbPost) {
      throw ApiError('Post not found', 404)
    }

    const favoriteResult = await postFavoritiesRepo.findByUserIdAndPostId(
      user.userId,
      postId
    )
    const dbFavorite: PostFavorite = favoriteResult.rows[0]

    if (dbFavorite) {
      await postFavoritiesRepo.deleteFavoriteById(dbFavorite.id)
      await cacheService.invalidateByPrefix(
        `users:${user.userId}:favorite-posts:*`
      )
      await cacheService.invalidateByPrefix(
        `users:${user.userId}:liked-posts:*`
      )
      await cacheService.invalidateByPrefix(`users:${user.userId}:posts:*`)

      return { isFavorite: false }
    }

    await postFavoritiesRepo.addFavorite(user.userId, postId)
    await cacheService.invalidateByPrefix(
      `users:${user.userId}:favorite-posts:*`
    )
    await cacheService.invalidateByPrefix(`users:${user.userId}:liked-posts:*`)
    await cacheService.invalidateByPrefix(`users:${user.userId}:posts:*`)

    return { isFavorite: true }
  },
}
