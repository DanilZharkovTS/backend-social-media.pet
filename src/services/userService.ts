import { userRepo } from '../repos/userRepo.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'

export const userService = {
  readMyInfo: async (user: TokenPayload) => {
    const userResult = await userRepo.findById(user.userId)

    return { info: userResult.rows[0] } 
  },
}
