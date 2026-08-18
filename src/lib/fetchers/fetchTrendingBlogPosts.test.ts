import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const getMock = vi.fn()
const setMock = vi.fn()
const getTokenMock = vi.fn()

vi.mock('@/lib/RedisHandler', () => ({
  get: (...args: unknown[]) => getMock(...args),
  set: (...args: unknown[]) => setMock(...args),
}))

vi.mock('@/widgets/UmamiWidget/UmamiWidget.data', () => ({
  getToken: (...args: unknown[]) => getTokenMock(...args),
}))

const { fetchTrendingBlogPosts } = await import('./fetchTrendingBlogPosts')

const fetchMock = vi.fn()

describe('fetchTrendingBlogPosts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', 'https://umami.example.com')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', 'site-abc')
    getMock.mockResolvedValue(null)
    getTokenMock.mockResolvedValue('token-abc')
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('filters to blog-post paths and strips the prefix', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/foo',
          y: 10,
        },
        {
          x: '/about',
          y: 999,
        },
        {
          x: '/blog/post/bar',
          y: 5,
        },
        {
          x: '/blog',
          y: 42,
        },
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'foo',
        views: 10,
      },
      {
        slug: 'bar',
        views: 5,
      },
    ])
  })

  it('sorts by view count descending even when the API response is unsorted', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/low',
          y: 1,
        },
        {
          x: '/blog/post/high',
          y: 100,
        },
        {
          x: '/blog/post/mid',
          y: 50,
        },
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'high',
        views: 100,
      },
      {
        slug: 'mid',
        views: 50,
      },
      {
        slug: 'low',
        views: 1,
      },
    ])
  })

  it('truncates results to the given limit', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/a',
          y: 3,
        },
        {
          x: '/blog/post/b',
          y: 2,
        },
        {
          x: '/blog/post/c',
          y: 1,
        },
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 2,
    })

    expect(result).toEqual([
      {
        slug: 'a',
        views: 3,
      },
      {
        slug: 'b',
        views: 2,
      },
    ])
  })

  it('returns cached data without calling fetch on a cache hit', async () => {
    getMock.mockResolvedValue([
      {
        x: '/blog/post/cached',
        y: 7,
      },
    ])

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'cached',
        views: 7,
      },
    ])
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('returns null when fetch/auth fails, without throwing', async () => {
    fetchMock.mockRejectedValue(new Error('network error'))

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toBeNull()
  })

  it('returns null and never calls fetch when getToken resolves null', async () => {
    getTokenMock.mockResolvedValue(null)

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toBeNull()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('caches the fetched metrics with a 45 minute TTL', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/foo',
          y: 10,
        },
      ],
    })

    await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(setMock).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 60 * 45)
  })
})
