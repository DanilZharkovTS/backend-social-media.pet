import { QueryResult } from '@supabase/supabase-js'
import { getRedis } from '../../lib/redisClient'
import { postLikesRepo } from '../../repos/user/postLikesRepo'
import { postRepo } from '../../repos/user/postRepo'
import { userService } from './userService'

jest.mock('../../repos/user/postLikesRepo')
jest.mock('../../repos/user/postRepo')
jest.mock('../../lib/redisClient')

const mockedPostLikesRepo = postLikesRepo as jest.Mocked<
  typeof postLikesRepo
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

describe('userService.getLikedPosts', () => {
  const mockUserId = 15
  let mockRedis: any

  beforeEach(() => {
    jest.clearAllMocks()

    mockRedis = {
      get: jest.fn(),
      set: jest.fn(),
    }
    ;(getRedis as jest.Mock).mockReturnValue(mockRedis)
  })

  test('returns posts from redis if cache exists', async () => {
    const cachedPosts = [{ id: 1, description: 'cached post' }]

    mockRedis.get.mockResolvedValue(JSON.stringify(cachedPosts))

    const result = await userService.getLikedPosts(mockUserId)

    expect(mockRedis.get).toHaveBeenCalledWith(
      `users:${mockUserId}:liked-posts`
    )

    expect(mockedPostLikesRepo.findByUserId).not.toHaveBeenCalled()
    expect(mockedPostRepo.findByIds).not.toHaveBeenCalled()

    expect(mockRedis.set).not.toHaveBeenCalled()

    expect(result).toEqual({ posts: cachedPosts })
  })

  test('fetches from db and saves to redis if cache is empty', async () => {
    mockRedis.get.mockResolvedValue(null)

    mockedPostLikesRepo.findByUserId.mockResolvedValue(
      mockQueryResult([{ post_id: 1 }, { post_id: 2 }])
    )

    mockedPostRepo.findByIds.mockResolvedValue(
      mockQueryResult([
        { id: 1, description: 'post1' },
        { id: 2, description: 'post2' },
      ])
    )

    const result = await userService.getLikedPosts(mockUserId)

    expect(mockedPostLikesRepo.findByUserId).toHaveBeenCalledWith(mockUserId)

    expect(mockedPostRepo.findByIds).toHaveBeenCalledWith([1, 2])

    expect(mockRedis.set).toHaveBeenCalledWith(
      `users:${mockUserId}:liked-posts`,
      JSON.stringify([
        { id: 1, description: 'post1' },
        { id: 2, description: 'post2' },
      ])
    )

    expect(result).toEqual({
      posts: [
        { id: 1, description: 'post1' },
        { id: 2, description: 'post2' },
      ],
    })
  })

  test('handles empty liked posts correctly', async () => {
    mockRedis.get.mockResolvedValue(null)

    mockedPostLikesRepo.findByUserId.mockResolvedValue(mockQueryResult([]))

    mockedPostRepo.findByIds.mockResolvedValue(mockQueryResult([]))

    const result = await userService.getLikedPosts(mockUserId)

    expect(result).toEqual({ posts: [] })

    expect(mockRedis.set).toHaveBeenCalledWith(
      `users:${mockUserId}:liked-posts`,
      JSON.stringify([])
    )
  })
})
