import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { get, getClient, set } from '@/lib/RedisHandler'
import { CollectionSlug } from '@/types/collections'

/** Key prefix for per-slug existence lookups, so the set can be cleared as a group. */
const CACHE_PREFIX = 'pages:slug-exists:'

/**
 * Safety net for rows changed without going through the collection hooks (a
 * direct DB write, a restored dump). Hook-driven invalidation (see
 * `revalidatePage`) is what normally keeps this fresh, so the window can be
 * generous. Backed by Redis' own EX expiry (via RedisHandler), so stale
 * entries drop out on their own instead of lingering until overwritten or swept.
 */
const TTL_SECONDS = 5 * 60

const cacheKeyFor = (slug: string): string => `${CACHE_PREFIX}${slug}`

interface CacheEntry {
  /** False is cached too: an unknown slug is the common case for a stray or scanning request. */
  exists: boolean
}

/**
 * Checks whether a published page exists for `slug`, memoizing the result —
 * including misses — in Redis.
 *
 * `proxy.ts` calls this for every request that would otherwise fall through
 * to the `[slug]` catch-all route, so the miss path is the hot one. It exists
 * because `notFound()` thrown from inside `[slug]/page.tsx` can no longer
 * change the response status once Cache Components has streamed that route's
 * static shell as a 200 — see the "Calling notFound() after streaming has
 * started" section of Next's own `notFound()` docs. Checking existence here,
 * before the response starts streaming, is what lets an unknown path return a
 * real 404.
 */
export const pageSlugExists = async (slug: string): Promise<boolean> => {
  const cacheKey = cacheKeyFor(slug)
  const cached = await get<CacheEntry>(cacheKey)

  if (cached) {
    return cached.exists
  }

  const payload = await getPayload({
    config,
  })

  const { totalDocs } = await payload.count({
    collection: CollectionSlug.Pages,
    overrideAccess: false,
    where: {
      slug: {
        equals: slug,
      },
      _status: {
        equals: 'published',
      },
    },
  })

  const exists = totalDocs > 0

  await set(
    cacheKey,
    {
      exists,
    } satisfies CacheEntry,
    TTL_SECONDS,
  )

  return exists
}

/**
 * Drops every cached slug-existence lookup. Called from `revalidatePage` so a
 * publish/unpublish/delete is reflected immediately rather than waiting out
 * the TTL.
 */
export const invalidatePageSlugCache = async (): Promise<void> => {
  try {
    const redis = await getClient()

    for await (const key of redis.scanIterator({
      MATCH: `${CACHE_PREFIX}*`,
    })) {
      await redis.del(key)
    }
  } catch (error) {
    console.error('Failed to invalidate page slug cache:', extractErrorMessage(error))
  }
}
