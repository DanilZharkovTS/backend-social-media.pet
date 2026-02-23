import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type { paginationDTO } from '../../interfaces/user/postInterfaces.ts'
import type {
  addCommentDTO,
  updateCommentDTO,
} from '../../interfaces/user/commentInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { commentRepo } from '../../repos/commentRepo.ts'
import { getRedis } from '../../lib/redisClient.ts'

export const commentServices = {
  //me
  add: async (data: addCommentDTO, postId: number, user: TokenPayload) => {    
    const result = await commentRepo.insert(data.content, postId, user.userId)
    
    return { result: result.rows[0] }
  },
  getAll: async (postId: number, pagination: paginationDTO) => {
    const redis = getRedis()
    const redisKey = `posts:${postId}:comments:page:${pagination.page}:limit:${pagination.limit}`

    const redisResult = await redis.get(redisKey)

    if (redisResult) {
      return {
        pagination: { limit: pagination.limit, page: pagination.page },
        result: JSON.parse(redisResult),
      }
    }
    const { rows: dbComments } = await commentRepo.selectAll(postId, pagination)

    await redis.set(redisKey, JSON.stringify(dbComments))

    return {
      pagination: { limit: pagination.limit, page: pagination.page },
      result: dbComments,
    }
  },
  update: async (
    commentId: number,
    data: updateCommentDTO,
    user: TokenPayload
  ) => {
    const commentUser = await commentRepo.selectById(commentId)

    if (user.userId !== commentUser.rows[0].user_id) {
      throw ApiError('You are not allowed to modify this comment', 403)
    }

    const result = await commentRepo.updateById(commentId, data)

    return { updated: result.rows[0] }
  },
  delete: async (commentId: number, user: TokenPayload) => {
    const commentUser = await commentRepo.selectById(commentId)

    if (user.userId !== commentUser.rows[0].user_id) {
      throw ApiError('You are not allowed to delete this comment', 403)
    }

    const result = await commentRepo.deleteById(commentId)

    return { deleted: result.rows[0] }
  },
  //admin
  deleteAsAdmin: async (commentId: number) => {
    const commentResult = await commentRepo.deleteById(commentId)
    if (commentResult.rows.length === 0) {
      throw ApiError('Comment is not found', 404)
    }

    return { deleted: commentResult.rows[0] }
  },
}
