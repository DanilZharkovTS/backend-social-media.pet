import { QueryResult } from '@supabase/supabase-js'
import { getRedis } from '../../lib/redisClient'
import { postLikesRepo } from '../../repos/user/postLikesRepo'
import { postFavoritiesRepo } from '../../repos/user/postFavoritiesRepo'
import { postRepo } from '../../repos/user/postRepo'
import { userService } from './userService'

jest.mock('../../repos/user/postLikesRepo')
jest.mock('../../repos/user/postFavoritiesRepo')
jest.mock('../../repos/user/postRepo')
jest.mock('../../lib/redisClient')

const mockedPostLikesRepo = postLikesRepo as jest.Mocked<
  typeof postLikesRepo
> & {
  findByUserId: jest.Mock
}

const mockedPostFavoritiesRepo = postFavoritiesRepo as jest.Mocked<
  typeof postFavoritiesRepo
> & {
  findByUserId: jest.Mock
}

const mockedPostRepo = postRepo as jest.Mocked<typeof postRepo> & {
  findByIds: jest.Mock
}

const mockQueryResult = <T>(rows: T[]): QueryResult<T> =>
  ({
    rows,
  } as QueryResult<T>)

describe('userService', () => {
  let mockRedis: any

  const mockedPagination = {
    page: 1,
    offset: 0,
    limit: 50,
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    }

    ;(getRedis as jest.Mock).mockReturnValue(mockRedis)
  })

  describe('getLikedPosts', () => {
    const mockUserId = 15

    test('returns posts from redis if cache exists', async () => {
      const cachedPosts = [{ id: 1, description: 'cached post' }]

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedPosts))

      const result = await userService.getLikedPosts(
        mockUserId,
        mockedPagination
      )

      expect(mockRedis.get).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`
      )

      expect(mockedPostLikesRepo.findByUserId).not.toHaveBeenCalled()
      expect(mockedPostRepo.findByIds).not.toHaveBeenCalled()
      expect(mockRedis.set).not.toHaveBeenCalled()

      expect(result).toEqual({
        posts: cachedPosts,
        pagination: mockedPagination,
      })
    })

    test('fetches from db and saves to redis if cache is empty', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostLikesRepo.findByUserId.mockResolvedValue(
        mockQueryResult([{ post_id: 1 }])
      )

      mockedPostRepo.findByIds.mockResolvedValue(
        mockQueryResult([{ id: 1, description: 'post1' }])
      )

      const result = await userService.getLikedPosts(
        mockUserId,
        mockedPagination
      )

      expect(mockedPostLikesRepo.findByUserId).toHaveBeenCalledWith(
        mockUserId
      )

      expect(mockedPostRepo.findByIds).toHaveBeenCalledWith(
        [1],
        mockedPagination
      )

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([{ id: 1, description: 'post1' }])
      )

      expect(result).toEqual({
        posts: [{ id: 1, description: 'post1' }],
        pagination: mockedPagination,
      })
    })

    test('handles empty liked posts correctly', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostLikesRepo.findByUserId.mockResolvedValue(
        mockQueryResult([])
      )

      mockedPostRepo.findByIds.mockResolvedValue(
        mockQueryResult([])
      )

      const result = await userService.getLikedPosts(
        mockUserId,
        mockedPagination
      )

      expect(result).toEqual({
        posts: [],
        pagination: mockedPagination,
      })

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([])
      )
    })
  })

  describe('getFavoritePosts', () => {
    const mockUser = { userId: 15 } as any

    test('returns posts from redis if cache exists', async () => {
      const cachedPosts = [{ id: 10, description: 'cached favorite' }]

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedPosts))

      const result = await userService.getFavoritePosts(
        mockUser,
        mockedPagination
      )

      expect(mockRedis.get).toHaveBeenCalledWith(
        `users:${mockUser.userId}:favorite-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`
      )

      expect(mockedPostFavoritiesRepo.findByUserId).not.toHaveBeenCalled()
      expect(mockedPostRepo.findByIds).not.toHaveBeenCalled()
      expect(mockRedis.set).not.toHaveBeenCalled()

      expect(result).toEqual({
        posts: cachedPosts,
        pagination: mockedPagination,
      })
    })

    test('fetches from db and saves to redis if cache is empty', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostFavoritiesRepo.findByUserId.mockResolvedValue(
        mockQueryResult([{ post_id: 3 }, { post_id: 4 }])
      )

      mockedPostRepo.findByIds.mockResolvedValue(
        mockQueryResult([
          { id: 3, description: 'fav1' },
          { id: 4, description: 'fav2' },
        ])
      )

      const result = await userService.getFavoritePosts(
        mockUser,
        mockedPagination
      )

      expect(mockedPostFavoritiesRepo.findByUserId).toHaveBeenCalledWith(
        mockUser.userId
      )

      expect(mockedPostRepo.findByIds).toHaveBeenCalledWith(
        [3, 4],
        mockedPagination
      )

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUser.userId}:favorite-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([
          { id: 3, description: 'fav1' },
          { id: 4, description: 'fav2' },
        ])
      )

      expect(result).toEqual({
        posts: [
          { id: 3, description: 'fav1' },
          { id: 4, description: 'fav2' },
        ],
        pagination: mockedPagination,
      })
    })

    test('handles empty favorite posts correctly', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostFavoritiesRepo.findByUserId.mockResolvedValue(
        mockQueryResult([])
      )

      mockedPostRepo.findByIds.mockResolvedValue(
        mockQueryResult([])
      )

      const result = await userService.getFavoritePosts(
        mockUser,
        mockedPagination
      )

      expect(result).toEqual({
        posts: [],
        pagination: mockedPagination,
      })

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUser.userId}:favorite-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([])
      )
    })
  })
})