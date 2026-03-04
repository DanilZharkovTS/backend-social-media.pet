import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type { paginationDTO } from '../../interfaces/user/postInterfaces.ts'
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
  readMyInfo: async (user: TokenPayload) => {
    const redis = getRedis()
    const toUserResponse = (user: User) => {
      return {
        id: user.id,
        role: user.role,
        email: user.email,
        name: user.name,
        bio: user.bio,
        birth_date: user.birth_date,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
        has_checkmark: user.has_checkmark,
      }
    }

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
  getLikedPosts: async (userId: number) => {
    const userPostLikesResult = await postLikesRepo.findByUserId(userId)
    const dbUserPostLikes = userPostLikesResult.rows
    const likedPostsIds = dbUserPostLikes.map((l) => l.post_id)

    const likedPostsResult = await postRepo.findByIds(likedPostsIds)
    const dbLikedPosts = likedPostsResult.rows

    return { posts: dbLikedPosts }
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
  readUserInfo: async (userId: number) => {
    const redis = getRedis()
    const toUserResponse = (user: User) => {
      return {
        id: user.id,
        name: user.name,
        bio: user.bio,
        birth_date: user.birth_date,
        created_at: user.created_at,
        avatar_url: user.avatar_url,
      }
    }

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
