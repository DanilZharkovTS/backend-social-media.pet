import { postRepo } from '../../repos/postRepo'
import { postService } from './postService'

jest.mock('../../repos/postRepo')

describe('postService', () => {
  const mockUser = { userId: 15, email: 'adminka@gmail.com', role: 'admin' }

  describe('addPost', () => {
    const mockData = { description: 'Hello this is test' }

    test('returns created post', async () => {
      ;(postRepo.insert as jest.Mock).mockResolvedValue({
        rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })

      const result = await postService.add(mockData, mockUser)

      expect(postRepo.insert).toHaveBeenCalledWith(15, 'Hello this is test')
      expect(result).toStrictEqual({
        created: { id: 123, user_id: 15, description: 'Hello this is test' },
      })
    })
  })

  describe('findPost', () => {
    const mockQuery = { search: 'Hello' }
    const mockPagination = { page: 1, limit: 50, offset: 0 }

    test('returns searched post', async () => {
      ;(postRepo.selectBySearch as jest.Mock).mockResolvedValue({
        rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })

      const result = await postService.find(mockQuery, mockPagination)

      expect(postRepo.selectBySearch).toHaveBeenCalledWith(
        mockQuery,
        mockPagination
      )
      expect(result).toStrictEqual({
        search: 'Hello',
        result: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })
    })
  })
})
