import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { get, invalidate, set } from '@/lib/RedisHandler'
import { CollectionSlug } from '@/types/collections'

import { fetchPublishedSlugs, invalidatePublishedSlugs } from './publishedSlugs'

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/RedisHandler', () => ({
  get: vi.fn(),
  set: vi.fn(),
  invalidate: vi.fn(),
}))

const find = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  // SAFETY: the module only calls `find` on the Payload instance.
  vi.mocked(getPayload).mockResolvedValue({ find } as never)
})

describe('fetchPublishedSlugs', () => {
  it('answers from Redis without querying', async () => {
    vi.mocked(get).mockResolvedValue(['about-me'])

    await expect(fetchPublishedSlugs(CollectionSlug.Pages)).resolves.toEqual(['about-me'])
    expect(find).not.toHaveBeenCalled()
  })

  it('queries published slugs only and caches them with a TTL', async () => {
    vi.mocked(get).mockResolvedValue(null)
    find.mockResolvedValue({ docs: [{ slug: 'about-me' }, { slug: 'legal-notice' }] })

    await expect(fetchPublishedSlugs(CollectionSlug.Pages)).resolves.toEqual([
      'about-me',
      'legal-notice',
    ])
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: CollectionSlug.Pages,
        where: { _status: { equals: 'published' } },
        select: { slug: true },
      }),
    )
    expect(set).toHaveBeenCalledWith(
      `route-slugs:${CollectionSlug.Pages}`,
      ['about-me', 'legal-notice'],
      expect.any(Number),
    )
  })

  it('does not filter résumé documents by status, they have no drafts', async () => {
    vi.mocked(get).mockResolvedValue(null)
    find.mockResolvedValue({ docs: [] })

    await fetchPublishedSlugs(CollectionSlug.ResumeDocuments)

    expect(find.mock.calls[0][0]).not.toHaveProperty('where')
  })
})

describe('invalidatePublishedSlugs', () => {
  it('drops the collection key and swallows Redis failures', async () => {
    vi.mocked(invalidate).mockRejectedValueOnce(new Error('down'))
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await expect(invalidatePublishedSlugs(CollectionSlug.BlogPosts)).resolves.toBeUndefined()
    expect(invalidate).toHaveBeenCalledWith(`route-slugs:${CollectionSlug.BlogPosts}`)
  })
})
