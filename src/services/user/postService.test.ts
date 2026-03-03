import { QueryResult } from 'pg'
import { postRepo } from '../../repos/user/postRepo'
import { postService } from './postService'
import { cacheService } from '../shared/cacheService'
import { postLikesRepo } from '../../repos/user/postLikesRepo'
import { postFavoritiesRepo } from '../../repos/user/postFavoritiesRepo'

jest.mock('../../repos/user/postRepo')
jest.mock('../../repos/user/postLikesRepo')
jest.mock('../../repos/user/postFavoritiesRepo')
jest.mock('../shared/cacheService', () => ({
  cacheService: {
    invalidateByPrefix: jest.fn(),
  },
}))
jest.mock('../../lib/redisClient', () => ({
  getRedis: jest.fn(() => ({
    get: jest.fn(),
    set: jest.fn(),
  })),
}))

const mockedPostRepo = postRepo as jest.Mocked<typeof postRepo>
const mockedPostLikesRepo = postLikesRepo as jest.Mocked<typeof postLikesRepo>
const mockedPostFavoritiesRepo = postFavoritiesRepo as jest.Mocked<
  typeof postFavoritiesRepo
>
const mockedCacheService = cacheService as jest.Mocked<typeof cacheService>

describe('postService', () => {
  const mockUser = { userId: 15, email: 'adminka@gmail.com', role: 'admin' }
  const mockWrongUser = {
    userId: 1488,
    email: 'adminka@gmail.com',
    role: 'admin',
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockQueryResult = (rows: any[]): QueryResult<any> =>
    ({ rows } as unknown as QueryResult<any>)

  describe('addPost', () => {
    const mockData = { description: 'Hello this is test' }

    test('returns created post and invalidates cache', async () => {
      mockedPostRepo.insert.mockResolvedValue(
        mockQueryResult([
          { id: 123, user_id: 15, description: 'Hello this is test' },
        ])
      )

      const result = await postService.add(mockData, mockUser)

      expect(result).toStrictEqual({
        created: { id: 123, user_id: 15, description: 'Hello this is test' },
      })
      expect(mockedPostRepo.insert).toHaveBeenCalledWith(
        15,
        'Hello this is test'
      )
      expect(mockedCacheService.invalidateByPrefix).toHaveBeenCalledWith(
        'posts:search:*'
      )
    })
  })

  describe('findPost', () => {
    const mockQuery = { search: 'Hello' }
    const mockPagination = { page: 1, limit: 50, offset: 0 }

    test('returns searched post', async () => {
      mockedPostRepo.selectBySearch.mockResolvedValue(
        mockQueryResult([
          { id: 123, user_id: 15, description: 'Hello this is test' },
        ])
      )

      mockedPostLikesRepo.findByUserIdAndPostsIds.mockResolvedValue(
        mockQueryResult([])
      )

      mockedPostFavoritiesRepo.findByUserIdAndPostIds.mockResolvedValue(
        mockQueryResult([])
      )

      const result = await postService.find(mockUser, mockQuery, mockPagination)

      expect(mockedPostRepo.selectBySearch).toHaveBeenCalledWith(
        mockQuery,
        mockPagination
      )

      expect(result).toStrictEqual({
        search: 'Hello',
        pagination: { page: 1, limit: 50 },
        posts: [
          {
            id: 123,
            user_id: 15,
            description: 'Hello this is test',
            isLiked: false,
            isFavorite: false,
          },
        ],
      })
    })
  })

  describe('deletePost', () => {
    describe('invalid', () => {
      test('fails if post was not found', async () => {
        mockedPostRepo.findById.mockResolvedValue(mockQueryResult([]))

        await expect(postService.delete(1488, mockUser)).rejects.toEqual({
          message: 'Post not found',
          status: 404,
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(1488)
      })

      test('fails if it not your post', async () => {
        mockedPostRepo.findById.mockResolvedValue(
          mockQueryResult([
            { id: 123, user_id: 15, description: 'Hello this is test' },
          ])
        )

        await expect(postService.delete(123, mockWrongUser)).rejects.toEqual({
          message: 'You are not allowed to delete this post',
          status: 403,
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(123)
      })
    })

    describe('valid', () => {
      test('returns deleted post and invalidates cache', async () => {
        mockedPostRepo.findById.mockResolvedValue(
          mockQueryResult([
            { id: 123, user_id: 15, description: 'Hello this is test' },
          ])
        )
        mockedPostRepo.deleteById.mockResolvedValue(
          mockQueryResult([
            { id: 123, user_id: 15, description: 'Hello this is test' },
          ])
        )

        const result = await postService.delete(123, mockUser)

        expect(result).toStrictEqual({
          deleted: { id: 123, user_id: 15, description: 'Hello this is test' },
        })
        expect(mockedPostRepo.findById).toHaveBeenCalledWith(123)
        expect(mockedPostRepo.deleteById).toHaveBeenCalledWith(123)
        expect(mockedCacheService.invalidateByPrefix).toHaveBeenCalledWith(
          'posts:search:*'
        )
      })
    })
  })
  describe('toggleLike', () => {
    test('removes like from post', async () => {
      mockedPostLikesRepo.findByUserIdAndPostId.mockResolvedValue(
        mockQueryResult([{ id: 123, user_id: 15, post_id: 321 }])
      )

      const result = await postService.toggleLike(mockUser, 321)

      expect(result).toStrictEqual({ isLiked: false })

      expect(mockedPostLikesRepo.findByUserIdAndPostId).toHaveBeenCalledWith(
        15,
        321
      )
      expect(mockedPostLikesRepo.deleteLikeById).toHaveBeenCalledWith(123)
      expect(mockedPostRepo.decreaseLikesCount).toHaveBeenCalledWith(321)
    })
    test('adds like to post', async () => {
      mockedPostLikesRepo.findByUserIdAndPostId.mockResolvedValue(
        mockQueryResult([])
      )

      const result = await postService.toggleLike(mockUser, 321)

      expect(result).toStrictEqual({ isLiked: true })

      expect(mockedPostLikesRepo.findByUserIdAndPostId).toHaveBeenCalledWith(
        15,
        321
      )
      expect(mockedPostLikesRepo.addLike).toHaveBeenCalledWith(15, 321)
      expect(mockedPostRepo.increaseLikesCount).toHaveBeenCalledWith(321)
    })
  })
})
