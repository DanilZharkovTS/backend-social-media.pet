import type {
  addPostInterface,
  paginationDTO,
} from '../interfaces/postInterfaces.ts'
import { postRepo } from '../repos/postRepo.ts'
import { userRepo } from '../repos/userRepo.ts'

export const postService = {
  add: async (data: addPostInterface) => {
    const userResult = await userRepo.insert(data.name)
    const postResult = await postRepo.insert(
      userResult.rows[0].id,
      data.description
    )
    return postResult
  },
  getAll: async (pagination: paginationDTO) => {
    const result = await postRepo.selectAll(pagination)
    return {
      pagination: { page: pagination.page, limit: pagination.limit },
      posts: result.rows,
    }
  },
}
