import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  paginationDTO,
  Post,
} from '../../interfaces/user/postInterfaces.ts'
import type {
  dynamicUpdateMyInfo,
  updateAvatarUrlDTO,
  updateEmail,
  updatePassword,
  User,
} from '../../interfaces/user/userInterfaces.ts'
import bcrypt from 'bcrypt'
import { getSupabaseClient } from '../../lib/supabaseClient.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { userRepo } from '../../repos/userRepo.ts'
import { getRedis } from '../../lib/redisClient.ts'
import { cacheService } from '../shared/cacheService.ts'
import { postLikesRepo } from '../../repos/user/postLikesRepo.ts'
import { postRepo } from '../../repos/user/postRepo.ts'
import { postFavoritiesRepo } from '../../repos/user/postFavoritiesRepo.ts'
import { postService } from './postService.ts'

export const userService = {
  //me
  uploadMyAvatar: async (user: TokenPayload, file) => {
    const supabase = getSupabaseClient()

    const fileName = `${user.userId}-${Date.now()}-${file.originalname
      .split('.')
      .pop()}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      })

    if (uploadError) {
      throw new Error(uploadError.message)
    }

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName)

    return { avatarUrl: urlData.publicUrl }
  },
  getMyInfo: async (user: TokenPayload) => {
    const redis = getRedis()
    const toUserResponse = (user: User) => ({
      id: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
      bio: user.bio,
      birth_date: user.birth_date,
      created_at: user.created_at,
      avatar_url: user.avatar_url,
      has_checkmark: user.has_checkmark,
    })

    const redisResult = await redis.get(`users:${user.userId}`)

    if (redisResult) {
      const redisUser = JSON.parse(redisResult)
      return toUserResponse(redisUser)
    }

    const userResult = await userRepo.findUserById(user.userId)
    const dbUser = userResult.rows[0]

    if (!dbUser) {
      throw ApiError('User not found', 404)
    }

    await redis.set(
      `users:${user.userId}`,
      JSON.stringify(dbUser),
      'EX',
      60 * 3
    )

    return toUserResponse(dbUser)
  },
  getFavoritePosts: async (user: TokenPayload, pagination: paginationDTO) => {
    const redis = getRedis()
    const redisKey = `users:${user.userId}:favorite-posts:page:${pagination.page}:limit:${pagination.limit}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      console.log('redis')

      const redisPosts = JSON.parse(redisResult)

      const postsWithFavorities = redisPosts.map((p: Post) => {
        return {
          ...p,
          isFavorite: true,
        }
      })
      const postsWithLikes = await postService.attachUserLikes(
        user,
        postsWithFavorities
      )

      return { posts: postsWithLikes, pagination }
    }
    console.log('db')

    const userPostFavoritiesResult = await postFavoritiesRepo.findByUserId(
      user.userId
    )
    const dbUserPostFavorities = userPostFavoritiesResult.rows
    const favoritePostsIds = dbUserPostFavorities.map((f) => f.post_id)

    const favoritePostsResult = await postRepo.findByIds(
      favoritePostsIds,
      pagination
    )
    const dbFavoritePosts = favoritePostsResult.rows

    await redis.set(redisKey, JSON.stringify(dbFavoritePosts), 'EX', 60)

    const postsWithFavorities = dbFavoritePosts.map((p: Post) => {
      return {
        ...p,
        isFavorite: true,
      }
    })
    const postsWithLikes = await postService.attachUserLikes(
      user,
      postsWithFavorities
    )

    return { posts: postsWithLikes, pagination }
  },
  updateMyInfo: async (user: TokenPayload, data: dynamicUpdateMyInfo) => {
    const userResult = await userRepo.updateMyInfoById(user.userId, data)

    await cacheService.invalidateByPrefix(`user:${user.userId}:*`)

    return { updated: userResult.rows[0] }
  },
  updateMyEmail: async (user: TokenPayload, data: updateEmail) => {
    const userResult = await userRepo.findUserById(user.userId)
    const userDb = userResult.rows[0]

    const isValidPassword = await bcrypt.compare(data.password, userDb.password)

    if (!isValidPassword) {
      throw ApiError('Password is not valid', 401)
    }

    if (userDb.email === data.newEmail) {
      throw ApiError('A new email cannot be the same as old one', 400)
    }

    await userRepo.updateMyEmailById(user.userId, data.newEmail)

    await cacheService.invalidateByPrefix(`user:${user.userId}:*`)

    return { newEmail: data.newEmail }
  },
  updateMyPassword: async (user: TokenPayload, data: updatePassword) => {
    const saltRounds = 10

    const userResult = await userRepo.findUserById(user.userId)
    const userDb = userResult.rows[0]

    const isValidPassword = await bcrypt.compare(
      data.oldPassword,
      userDb.password
    )
    if (!isValidPassword) {
      throw ApiError('Password is not valid', 401)
    }

    if (data.oldPassword === data.newPassword) {
      throw ApiError('A new password cannot be the same as old one', 400)
    }

    const hashedPassword = await bcrypt.hash(data.newPassword, saltRounds)
    await userRepo.updateMyPasswordById(user.userId, hashedPassword)

    await cacheService.invalidateByPrefix(`user:${user.userId}:*`)

    return { isChangedPassword: true }
  },
  updateMyAvatarUrl: async (user: TokenPayload, data: updateAvatarUrlDTO) => {
    const avatarResult = await userRepo.updateMyAvatarById(
      data.avatar_url,
      user.userId
    )

    await cacheService.invalidateByPrefix(`user:${user.userId}:*`)

    return { avatarUrl: avatarResult.rows[0].avatar_url }
  },
  //users
  getUserInfo: async (userId: number) => {
    const redis = getRedis()
    const toUserResponse = (user: User) => ({
      id: user.id,
      name: user.name,
      bio: user.bio,
      birth_date: user.birth_date,
      created_at: user.created_at,
      avatar_url: user.avatar_url,
      has_checkmark: user.has_checkmark,
    })

    const redisResult = await redis.get(`user:${userId}`)

    if (redisResult) {
      const redisUser = JSON.parse(redisResult)
      return toUserResponse(redisUser)
    }

    const userResult = await userRepo.findUserById(userId)
    const dbUser = userResult.rows[0]

    if (!dbUser) {
      throw ApiError('Uset not found', 404)
    }

    await redis.set(`user:${userId}`, JSON.stringify(dbUser))

    return toUserResponse(dbUser)
  },
  getUserPosts: async (
    user: TokenPayload,
    postsUserId: number,
    pagination: paginationDTO
  ) => {
    const redis = getRedis()
    const redisKey = `users:${postsUserId}:posts:page:${pagination.page}:limit:${pagination.limit}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      const redisPosts = JSON.parse(redisResult)
      if (redisPosts.length === 0) return { posts: [], pagination }

      const postsWithLike = await postService.attachUserLikes(user, redisPosts)
      const postsWithFavorite = await postService.attachUserFavorities(
        user,
        postsWithLike
      )

      return { posts: postsWithFavorite, pagination }
    }

    const postsResult = await postRepo.findByUserId(postsUserId)
    const dbPosts = postsResult.rows

    await redis.set(redisKey, JSON.stringify(dbPosts), 'EX', 60)

    if (dbPosts.length === 0) return { posts: [], pagination }

    const postsWithLike = await postService.attachUserLikes(user, dbPosts)
    const postsWithFavorite = await postService.attachUserFavorities(
      user,
      postsWithLike
    )

    return { posts: postsWithFavorite, pagination }
  },
  getLikedPosts: async (
    user: TokenPayload,
    userId: number,
    pagination: paginationDTO
  ) => {
    const redis = getRedis()
    const redisKey = `users:${userId}:liked-posts:page:${pagination.page}:limit:${pagination.limit}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      console.log('redis')

      const redisPosts = JSON.parse(redisResult)

      const postsWithLike = redisPosts.map((p: Post) => {
        return {
          ...p,
          isLiked: true,
        }
      })
      const postsWithFavorite = await postService.attachUserFavorities(
        user,
        postsWithLike
      )

      return { posts: postsWithFavorite, pagination }
    }
    console.log('db')

    const userPostLikesResult = await postLikesRepo.findByUserId(userId)
    const dbUserPostLikes = userPostLikesResult.rows
    const likedPostsIds = dbUserPostLikes.map((l) => l.post_id)

    const likedPostsResult = await postRepo.findByIds(likedPostsIds, pagination)
    const dbLikedPosts = likedPostsResult.rows

    await redis.set(redisKey, JSON.stringify(dbLikedPosts), 'EX', 60)

    const postsWithLike = dbLikedPosts.map((p: Post) => {
      return {
        ...p,
        isLiked: true,
      }
    })
    const postsWithFavorite = await postService.attachUserFavorities(
      user,
      postsWithLike
    )

    return { posts: postsWithFavorite, pagination }
  },
  //admin
  findAsAdmin: async (search: string, pagination: paginationDTO) => {
    const userResult = await userRepo.findBySearch(search, pagination)
    if (userResult.rows.length === 0) {
      throw ApiError('No users found', 404)
    }

    return {
      pagination: { page: pagination.page, limit: pagination.limit },
      result: userResult.rows,
    }
  },
}
