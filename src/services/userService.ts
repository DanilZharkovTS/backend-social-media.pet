import bcrypt from 'bcrypt'
import { userRepo } from '../repos/userRepo.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import type {
  dynamicUpdateMyInfo,
  updateAvatarUrlDTO,
  updatePassword,
} from '../interfaces/userInterfaces.ts'
import { getSupabaseClient } from '../lib/supabaseClient.ts'
import { ApiError } from '../lib/ApiErrors.ts'

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
    const userResult = await userRepo.findUserById(user.userId)

    const { id, role, email, name, bio, birth_date, created_at, avatar_url } =
      userResult.rows[0]

    return {
      info: { id, role, email, name, bio, birth_date, created_at, avatar_url },
    }
  },
  updateMyInfo: async (user: TokenPayload, data: dynamicUpdateMyInfo) => {
    const userResult = await userRepo.updateMyInfoById(user.userId, data)

    return { updated: userResult.rows[0] }
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

    return { isChangedPassword: true }
  },
  updateMyAvatarUrl: async (user: TokenPayload, data: updateAvatarUrlDTO) => {
    const avatarResult = await userRepo.updateMyAvatarById(
      data.avatar_url,
      user.userId
    )

    return { avatarUrl: avatarResult.rows[0].avatar_url }
  },

  //users
  readUserInfo: async (userId: number) => {
    const userResult = await userRepo.findUserById(userId)

    const { id, name, bio, birth_date, created_at, avatar_url } =
      userResult.rows[0]

    return { info: { id, name, bio, birth_date, created_at, avatar_url } }
  },
}
