import type { TokenPayload } from '../../interfaces/auth/authInterfaces.ts'
import type {
  addPostInterface,
  findPostDTO,
  paginationDTO,
  updatePostDTO,
} from '../../interfaces/user/postInterfaces.ts'
import { ApiError } from '../../lib/ApiErrors.ts'
import { postRepo } from '../../repos/postRepo.ts'

export const postService = {
  //me
  add: async (data: addPostInterface, user: TokenPayload) => {
    const result = await postRepo.insert(user.userId, data.description)
    return { created: result.rows[0] }
  },
  getAll: async (pagination: paginationDTO) => {
    const result = await postRepo.selectAll(pagination)
    return {
      pagination: { page: pagination.page, limit: pagination.limit },
      posts: result.rows,
    }
  },
  update: async (id: number, data: updatePostDTO, user: TokenPayload) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw ApiError('Post not found', 404)

    const userId = post.rows[0].user_id
    if (userId !== user.userId) {
      throw ApiError('You are not allowed to modify this post', 403)
    }

    const result = await postRepo.update(id, data)
    return {
      updated: result.rows[0],
    }
  },
  delete: async (id: number, user: TokenPayload) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw ApiError('Post not found', 404)

    const userId = post.rows[0].user_id
    if (userId !== user.userId) {
      throw ApiError('You are not allowed to delete this post', 403)
    }

    const result = await postRepo.deleteById(id)
    return { deleted: result.rows[0] }
  },
  find: async (query: findPostDTO, pagination: paginationDTO) => {
    const result = await postRepo.selectBySearch(query, pagination)
    return {
      search: query.search,
      result: result.rows,
    }
  },
  //admin
  deleteAsAdmin: async (postId: number) => {
    const deletedPost = await postRepo.deleteById(postId)
    if (deletedPost.rows.length === 0) throw ApiError('Post not found', 404)

    return { deleted: deletedPost.rows[0] }
  },
}
