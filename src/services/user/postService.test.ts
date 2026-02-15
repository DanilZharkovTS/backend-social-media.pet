import { postRepo } from '../../repos/postRepo'
import { postService } from './postService'

jest.mock('../../repos/postRepo')

describe('postService', () => {
  describe('addPost', () => {
    const mockData = { description: 'Hello this is test' }
    const mockUser = { userId: 15, email: 'adminka@gmail.com', role: 'admin' }
    test('returns created post', async () => {
      (postRepo.insert as jest.Mock).mockResolvedValue({
        rows: [{ id: 123, user_id: 15, description: 'Hello this is test' }],
      })

      const result = await postService.add(mockData, mockUser)

      expect(postRepo.insert).toHaveBeenCalledWith(15, 'Hello this is test')
      expect(result).toStrictEqual({
        created: { id: 123, user_id: 15, description: 'Hello this is test' },
      })
    })
  })
})
