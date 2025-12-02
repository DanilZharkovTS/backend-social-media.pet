import { userRepo } from '../repos/userRepo.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'

export const userService = {
  readMyInfo: async (user: TokenPayload) => {
    const userResult = await userRepo.findMeById(user.userId)

    return { info: userResult.rows[0] }
  },
  readUserInfo: async (userId: number) => {
    const userResult = await userRepo.findUserById(userId)

    return { info: userResult.rows[0] }
  },
}
