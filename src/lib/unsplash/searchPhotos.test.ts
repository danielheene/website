import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { UnsplashApiSearchResponse } from './types'

const fetchMock = vi.fn()

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('UNSPLASH_ACCESS_KEY', 'test-access-key')
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  fetchMock.mockReset()
})

const { searchPhotos } = await import('./searchPhotos')

const rawResponse = (): UnsplashApiSearchResponse => ({
  total: 1,
  total_pages: 1,
  results: [
    {
      id: 'abc123',
      description: null,
      alt_description: 'a mountain at sunset',
      width: 4000,
      height: 3000,
      urls: {
        full: 'https://images.unsplash.com/abc123-full',
        thumb: 'https://images.unsplash.com/abc123-thumb',
      },
      links: {
        download_location: 'https://api.unsplash.com/photos/abc123/download',
      },
      user: {
        name: 'Jane Doe',
        links: {
          html: 'https://unsplash.com/@janedoe',
        },
      },
    },
  ],
})

describe('searchPhotos', () => {
  it('sends the query and page to Unsplash and returns a trimmed shape', async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => rawResponse(),
    })

    const result = await searchPhotos({
      query: 'mountains',
      page: 1,
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain('https://api.unsplash.com/search/photos')
    expect(String(url)).toContain('query=mountains')
    expect(String(url)).toContain('page=1')
    expect(init.headers.Authorization).toBe('Client-ID test-access-key')

    expect(result).toEqual({
      total: 1,
      totalPages: 1,
      results: [
        {
          id: 'abc123',
          thumbUrl: 'https://images.unsplash.com/abc123-thumb',
          description: 'a mountain at sunset',
          photographerName: 'Jane Doe',
          photographerProfileUrl: 'https://unsplash.com/@janedoe',
          width: 4000,
          height: 3000,
        },
      ],
    })
  })

  it('falls back to an empty description when Unsplash provides none', async () => {
    const raw = rawResponse()
    raw.results[0].alt_description = null
    fetchMock.mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => raw,
    })

    const result = await searchPhotos({
      query: 'mountains',
      page: 1,
    })

    expect(result.results[0].description).toBe('')
  })

  it('throws a friendly error when UNSPLASH_ACCESS_KEY is not configured', async () => {
    vi.stubEnv('UNSPLASH_ACCESS_KEY', '')

    await expect(
      searchPhotos({
        query: 'mountains',
        page: 1,
      }),
    ).rejects.toThrow(/UNSPLASH_ACCESS_KEY/)

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws when Unsplash responds with a non-2xx status', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({
        errors: [
          'Rate Limit Exceeded',
        ],
      }),
    })

    await expect(
      searchPhotos({
        query: 'mountains',
        page: 1,
      }),
    ).rejects.toThrow(/Rate Limit Exceeded/)
  })

  it('throws when the network request itself fails', async () => {
    fetchMock.mockRejectedValue(new Error('network unreachable'))

    await expect(
      searchPhotos({
        query: 'mountains',
        page: 1,
      }),
    ).rejects.toThrow(/network unreachable/)
  })
})
