import { postRepo } from '../../repos/user/postRepo'
import { postService } from './postService'

jest.mock('../../repos/postRepo')
const mockedPostRepo = postRepo as jest.Mocked<typeof postRepo>

describe('postService', () => {
  const mockUser = { userId: 15, email: 'adminka@gmail.com', role: 'admin' }
  const mockWrongUser = {
    userId: 1488,
    email: 'adminka@gmail.com',
    role: 'admin',
  }

  describe('addPost', () => {
    const mockData = { description: 'Hello this is test' }

    test('returns created post', async () => {
      mockedPostRepo.insert.mockResolvedValue({
        rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })

      const result = await postService.add(mockData, mockUser)

      expect(result).toStrictEqual({
        created: { id: 123, user_id: 15, description: 'Hello this is test' },
      })
      expect(postRepo.insert).toHaveBeenCalledWith(15, 'Hello this is test')
    })
  })

  describe('findPost', () => {
    const mockQuery = { search: 'Hello' }
    const mockPagination = { page: 1, limit: 50, offset: 0 }

    test('returns searched post', async () => {
      mockedPostRepo.selectBySearch.mockResolvedValue({
        rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })

      const result = await postService.find(mockQuery, mockPagination)

      expect(mockedPostRepo.selectBySearch).toHaveBeenCalledWith(
        mockQuery,
        mockPagination
      )
      expect(result).toStrictEqual({
        search: 'Hello',
        result: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })
    })
  })

  describe('deletePost', () => {
    describe('invalid', () => {
      test('fails if post was not found', async () => {
        mockedPostRepo.findById.mockResolvedValue({ rows: [] })

        await expect(postService.delete(1488, mockUser)).rejects.toEqual({
          message: 'Post not found',
          status: 404,
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(1488)
      })

      test('fails if it not your post', async () => {
        mockedPostRepo.findById.mockResolvedValue({
          rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
        })

        await expect(postService.delete(123, mockWrongUser)).rejects.toEqual({
          message: 'You are not allowed to delete this post',
          status: 403,
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(123)
      })
    })
    describe('valid', () => {
      test('returns deleted post', async () => {
        mockedPostRepo.findById.mockResolvedValue({
          rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
        })
        mockedPostRepo.deleteById.mockResolvedValue({
          rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
        })

        const result = await postService.delete(123, mockUser)

        expect(result).toStrictEqual({
          deleted: { id: 123, user_id: 15, description: 'Hello this is test' },
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(123)
        expect(mockedPostRepo.deleteById).toHaveBeenCalledWith(123)
      })
    })
  })
})
