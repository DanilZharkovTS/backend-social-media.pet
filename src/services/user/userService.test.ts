import { QueryResult } from '@supabase/supabase-js'
import { getRedis } from '../../lib/redisClient'
import { postLikesRepo } from '../../repos/user/postLikesRepo'
import { postFavoritiesRepo } from '../../repos/user/postFavoritiesRepo'
import { postRepo } from '../../repos/user/postRepo'
import { userService } from './userService'
import { postService } from './postService'

jest.mock('../../repos/user/postLikesRepo')
jest.mock('../../repos/user/postFavoritiesRepo')
jest.mock('../../repos/user/postRepo')
jest.mock('../../lib/redisClient')

jest.mock('./postService', () => ({
  postService: {
    attachUserLikes: jest.fn(async (_user, posts) => posts),
    attachUserFavorities: jest.fn(async (_user, posts) => posts),
  },
}))

const mockedPostLikesRepo = postLikesRepo as jest.Mocked<
  typeof postLikesRepo
> & { findByUserId: jest.Mock }

const mockedPostFavoritiesRepo = postFavoritiesRepo as jest.Mocked<
  typeof postFavoritiesRepo
> & { findByUserId: jest.Mock }

const mockedPostRepo = postRepo as jest.Mocked<typeof postRepo> & {
  findByIds: jest.Mock
  findByUserId: jest.Mock
}

const mockQueryResult = <T>(rows: T[]): QueryResult<T> =>
  ({
    rows,
  } as QueryResult<T>)

describe('userService', () => {
  let mockRedis: any

  const mockUser = { userId: 15, email: 'adminka@gmail.com', role: 'admin' }

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

  describe('getUserPosts', () => {
    const postsUserId = 42

    test('returns posts from redis if cache exists', async () => {
      const cachedPosts = [
        { id: 1, description: 'cached post' },
        { id: 2, description: 'cached post2' },
      ]

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedPosts))

      const result = await userService.getUserPosts(
        mockUser,
        postsUserId,
        mockedPagination
      )

      expect(mockRedis.get).toHaveBeenCalledWith(
        `users:${postsUserId}:posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`
      )

      expect(mockedPostRepo.findByUserId).not.toHaveBeenCalled()

      expect(result).toEqual({
        posts: cachedPosts,
        pagination: mockedPagination,
      })
    })

    test('fetches posts from db and saves to redis if cache empty', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostRepo.findByUserId.mockResolvedValue(
        mockQueryResult([
          { id: 1, description: 'post1' },
          { id: 2, description: 'post2' },
        ])
      )

      const result = await userService.getUserPosts(
        mockUser,
        postsUserId,
        mockedPagination
      )

      expect(mockedPostRepo.findByUserId).toHaveBeenCalledWith(postsUserId)

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${postsUserId}:posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([
          { id: 1, description: 'post1' },
          { id: 2, description: 'post2' },
        ]),
        'EX',
        60
      )

      expect(result).toEqual({
        posts: [
          { id: 1, description: 'post1' },
          { id: 2, description: 'post2' },
        ],
        pagination: mockedPagination,
      })
    })

    test('returns empty posts if db returns empty', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostRepo.findByUserId.mockResolvedValue(mockQueryResult([]))

      const result = await userService.getUserPosts(
        mockUser,
        postsUserId,
        mockedPagination
      )

      expect(result).toEqual({
        posts: [],
        pagination: mockedPagination,
      })

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${postsUserId}:posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([]),
        'EX',
        60
      )
    })

    test('returns empty if redis cache contains empty array', async () => {
      mockRedis.get.mockResolvedValue(JSON.stringify([]))

      const result = await userService.getUserPosts(
        mockUser,
        postsUserId,
        mockedPagination
      )

      expect(result).toEqual({
        posts: [],
        pagination: mockedPagination,
      })
    })
  })

  describe('getLikedPosts', () => {
    const mockUserId = 15

    test('returns posts from redis if cache exists', async () => {
      const cachedPosts = [{ id: 1, description: 'cached post' }]

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedPosts))

      const result = await userService.getLikedPosts(
        mockUser,
        mockUserId,
        mockedPagination
      )

      expect(mockRedis.get).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`
      )

      expect(result).toEqual({
        posts: [{ id: 1, description: 'cached post', isLiked: true }],
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
        mockUser,
        mockUserId,
        mockedPagination
      )

      expect(mockedPostLikesRepo.findByUserId).toHaveBeenCalledWith(mockUserId)

      expect(mockedPostRepo.findByIds).toHaveBeenCalledWith(
        [1],
        mockedPagination
      )

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([{ id: 1, description: 'post1' }]),
        'EX',
        60
      )

      expect(result).toEqual({
        posts: [{ id: 1, description: 'post1', isLiked: true }],
        pagination: mockedPagination,
      })
    })

    test('handles empty liked posts correctly', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostLikesRepo.findByUserId.mockResolvedValue(mockQueryResult([]))
      mockedPostRepo.findByIds.mockResolvedValue(mockQueryResult([]))

      const result = await userService.getLikedPosts(
        mockUser,
        mockUserId,
        mockedPagination
      )

      expect(result).toEqual({
        posts: [],
        pagination: mockedPagination,
      })

      expect(mockRedis.set).toHaveBeenCalledWith(
        `users:${mockUserId}:liked-posts:page:${mockedPagination.page}:limit:${mockedPagination.limit}`,
        JSON.stringify([]),
        'EX',
        60
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

      expect(result).toEqual({
        posts: [{ id: 10, description: 'cached favorite', isFavorite: true }],
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
        ]),
        'EX',
        60
      )

      expect(result).toEqual({
        posts: [
          { id: 3, description: 'fav1', isFavorite: true },
          { id: 4, description: 'fav2', isFavorite: true },
        ],
        pagination: mockedPagination,
      })
    })

    test('handles empty favorite posts correctly', async () => {
      mockRedis.get.mockResolvedValue(null)

      mockedPostFavoritiesRepo.findByUserId.mockResolvedValue(
        mockQueryResult([])
      )

      mockedPostRepo.findByIds.mockResolvedValue(mockQueryResult([]))

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
        JSON.stringify([]),
        'EX',
        60
      )
    })
  })
})
