import { beforeEach, describe, expect, it, vi } from 'vitest'

import { FEATURED_TOPICS_TAG } from '@/lib/blog/featuredTopics'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'

import { revalidateBlogTopic } from './revalidateBlogTopic'

vi.mock('@/lib/revalidation/revalidateCache', () => ({
  revalidateCache: vi.fn(async () => true),
}))

beforeEach(() => {
  vi.clearAllMocks()
})

describe('revalidateBlogTopic', () => {
  it('clears topics, the posts that show them and the featured-topics navigation', async () => {
    // SAFETY: the hook only reads `doc.slug`, `context` and `req.payload.logger`.
    await revalidateBlogTopic({
      doc: { slug: 'cms' },
      context: {},
      req: { payload: { logger: { info: vi.fn() } } },
    } as never)

    expect(revalidateCache).toHaveBeenCalledWith({
      tags: [CollectionSlug.BlogTopics, CollectionSlug.BlogPosts, FEATURED_TOPICS_TAG],
      paths: ['/blog/cms'],
    })
  })
})
