import type { paginationDTO } from '../interfaces/postInterfaces.ts'
import type {
  addCommentDTO,
  deleteCommentDTO,
  updateCommentDTO,
} from '../interfaces/commentInterfaces.ts'
import { commentRepo } from '../repos/commentRepo.ts'
import { userRepo } from '../repos/userRepo.ts'
import type { TokenPayload } from '../interfaces/authInterfaces.ts'

export const commentServices = {
  //me
  add: async (data: addCommentDTO, postId: number, user: TokenPayload) => {
    const result = await commentRepo.insert(data.content, postId, user.userId)
    return { result: result.rows[0] }
  },
  getAll: async (postId: number, pagination: paginationDTO) => {
    const result = await commentRepo.selectAll(postId, pagination)
    return {
      pagination: { limit: pagination.limit, page: pagination.page },
      result: result.rows,
    }
  },
  update: async (
    commentId: number,
    data: updateCommentDTO,
    user: TokenPayload
  ) => {
    const commentUser = await commentRepo.selectById(commentId)
    if (user.userId !== commentUser.rows[0].user_id)
      throw new Error('Not your comment')

    const result = await commentRepo.updateById(commentId, data)

    return { updated: result.rows[0] }
  },
  delete: async (commentId: number, user: TokenPayload) => {
    const commentUser = await commentRepo.selectById(commentId)
    if (user.userId !== commentUser.rows[0].user_id)
      throw new Error('Not your comment')

    const result = await commentRepo.deleteById(commentId)

    return { deleted: result.rows[0] }
  },
  //admin
  deleteAsAdmin: async (commentId: number) => {
    const commentResult = await commentRepo.deleteById(commentId)
    if (commentResult.rows.length === 0) throw new Error('Comment is not found')

    return { deleted: commentResult.rows[0] }
  },
}
