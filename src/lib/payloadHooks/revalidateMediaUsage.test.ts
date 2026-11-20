import { beforeEach, describe, expect, it, vi } from 'vitest'

import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'

import { revalidateMediaUsageHooks } from './revalidateMediaUsage'

vi.mock('@/lib/revalidation/revalidateCache', () => ({
  revalidateCache: vi.fn(async () => true),
}))

// SAFETY: the hooks only read `doc` and `context` from their arguments.
const call = (hook: unknown, context: Record<string, unknown> = {}) =>
  (hook as (args: object) => Promise<unknown>)({ doc: { id: 1 }, context })

const EXPECTED_TAGS = [
  CollectionSlug.MediaImages,
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
]

beforeEach(() => {
  vi.clearAllMocks()
})

describe('revalidateMediaUsageHooks', () => {
  const hooks = revalidateMediaUsageHooks(CollectionSlug.MediaImages)

  it('clears the media tag and every content tag that embeds media on change and delete', async () => {
    await call(hooks.afterChange)
    await call(hooks.afterDelete)

    expect(revalidateCache).toHaveBeenNthCalledWith(1, { tags: EXPECTED_TAGS })
    expect(revalidateCache).toHaveBeenNthCalledWith(2, { tags: EXPECTED_TAGS })
  })

  it('respects skipRevalidate', async () => {
    await call(hooks.afterChange, { skipRevalidate: true })
    await call(hooks.afterDelete, { skipRevalidate: true })

    expect(revalidateCache).not.toHaveBeenCalled()
  })
})
