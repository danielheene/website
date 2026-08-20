import { getPayload } from 'payload'

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

vi.mock('@payload-config', () => ({
  default: {},
}))

const { fetchTrendingBlogPosts } = await import('./fetchTrendingBlogPosts')

const fetchMock = vi.fn()
const findMock = vi.fn()

const docFor = (slug: string) => ({
  id: slug,
  title: `Title: ${slug}`,
  slug,
})

describe('fetchTrendingBlogPosts', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', fetchMock)
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', 'https://umami.example.com')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', 'site-abc')
    getMock.mockResolvedValue(null)
    getTokenMock.mockResolvedValue('token-abc')

    findMock.mockReset()
    findMock.mockResolvedValue({
      docs: [],
    })
    vi.mocked(getPayload).mockResolvedValue({
      find: findMock,
    } as never)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  it('filters to blog-post paths, strips the prefix, and resolves matching documents', async () => {
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
    findMock.mockResolvedValue({
      docs: [
        docFor('foo'),
        docFor('bar'),
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
        post: docFor('foo'),
      },
      {
        slug: 'bar',
        views: 5,
        post: docFor('bar'),
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
    findMock.mockResolvedValue({
      docs: [
        docFor('low'),
        docFor('high'),
        docFor('mid'),
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
        post: docFor('high'),
      },
      {
        slug: 'mid',
        views: 50,
        post: docFor('mid'),
      },
      {
        slug: 'low',
        views: 1,
        post: docFor('low'),
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
    findMock.mockResolvedValue({
      docs: [
        docFor('a'),
        docFor('b'),
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
        post: docFor('a'),
      },
      {
        slug: 'b',
        views: 2,
        post: docFor('b'),
      },
    ])
  })

  it('drops slugs with no matching document and preserves popularity order for the rest', async () => {
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
    // 'b' has no matching document (deleted/unpublished).
    findMock.mockResolvedValue({
      docs: [
        docFor('a'),
        docFor('c'),
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'a',
        views: 3,
        post: docFor('a'),
      },
      {
        slug: 'c',
        views: 1,
        post: docFor('c'),
      },
    ])
  })

  it('re-orders query results to match popularity ranking regardless of query return order', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/a',
          y: 10,
        },
        {
          x: '/blog/post/c',
          y: 5,
        },
      ],
    })
    // Query returns docs in a different order than the ranking.
    findMock.mockResolvedValue({
      docs: [
        docFor('c'),
        docFor('a'),
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'a',
        views: 10,
        post: docFor('a'),
      },
      {
        slug: 'c',
        views: 5,
        post: docFor('c'),
      },
    ])
  })

  it('returns null when the payload query throws, without throwing', async () => {
    fetchMock.mockResolvedValue({
      json: async () => [
        {
          x: '/blog/post/foo',
          y: 10,
        },
      ],
    })
    findMock.mockRejectedValue(new Error('db error'))

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toBeNull()
  })

  it('returns cached data without calling fetch on a cache hit', async () => {
    getMock.mockResolvedValue([
      {
        x: '/blog/post/cached',
        y: 7,
      },
    ])
    findMock.mockResolvedValue({
      docs: [
        docFor('cached'),
      ],
    })

    const result = await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(result).toEqual([
      {
        slug: 'cached',
        views: 7,
        post: docFor('cached'),
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
    findMock.mockResolvedValue({
      docs: [
        docFor('foo'),
      ],
    })

    await fetchTrendingBlogPosts({
      days: 7,
      limit: 10,
    })

    expect(setMock).toHaveBeenCalledWith(expect.any(String), expect.any(Array), 60 * 45)
  })
})
