import { userRepo } from '../repos/userRepo.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'
import type { dynamicUpdateMyInfo } from '../interfaces/userInterfaces.ts'

export const userService = {
  //me

  readMyInfo: async (user: TokenPayload) => {
    const userResult = await userRepo.findMeById(user.userId)

    return { info: userResult.rows[0] }
  },
  updateMyInfo: async (user: TokenPayload, data: dynamicUpdateMyInfo) => {
    const userResult = await userRepo.updateMyInfoById(user.userId, data)

    return { updated: userResult.rows[0] }
  },
  readUserInfo: async (userId: number) => {
    const userResult = await userRepo.findUserById(userId)

    return { info: userResult.rows[0] }
  },
}
