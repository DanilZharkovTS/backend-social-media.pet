import type { addCommentDTO } from '../interfaces/commentInterfaces.ts'
import { commentRepo } from '../repos/commentRepo.ts'
import { userRepo } from '../repos/userRepo.ts'

export const commentServices = {
  add: async (data: addCommentDTO, postId: number) => {
    const user = await userRepo.insert(data.name)
    const userId = user.rows[0].id
    const result = await commentRepo.insert(data.content, userId, postId)
    return result.rows[0]
  },
}
