import type { paginationDTO } from 'interfaces/postInterfaces.ts'
import type { addCommentDTO } from '../interfaces/commentInterfaces.ts'
import { commentRepo } from '../repos/commentRepo.ts'
import { userRepo } from '../repos/userRepo.ts'

export const commentServices = {
  add: async (data: addCommentDTO, postId: number) => {
    const user = await userRepo.insert(data.name)
    const userId = user.rows[0].id
    const result = await commentRepo.insert(data.content, userId, postId)
    return {result: result.rows[0]}
  },
  getAll: async (postId: number, pagination: paginationDTO) => {
    const result = await commentRepo.selectAll(postId, pagination)
    return {
      pagination: { limit: pagination.limit, page: pagination.page },
      result: result.rows,
    }
  },
}
