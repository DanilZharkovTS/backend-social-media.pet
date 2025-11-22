import type {
  addPostInterface,
  findPostDTO,
  paginationDTO,
  updatePostDTO,
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
  update: async (id: number, data: updatePostDTO) => {
    const result = await postRepo.update(id, data)
    return {
      updated: result.rows[0],
    }
  },
  delete: async (id: number, name: string) => {
    const post = await postRepo.findById(id)
    if (post.rows.length === 0) throw new Error('Not found')
    const userName = post.rows[0].name
    if (userName !== name) throw new Error('Not your post')

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
}
