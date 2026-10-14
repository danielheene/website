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
 * De-dupes concurrent lookups for the same slug within this process — a burst
 * of requests for the same unknown slug (a scanner, a broken client retry
 * loop) would otherwise all miss the Redis cache together and each run the
 * same `payload.count()` before the first one finishes populating it.
 */
const inFlight = new Map<string, Promise<boolean>>()

const queryPageSlugExists = async (slug: string): Promise<boolean> => {
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
    cacheKeyFor(slug),
    {
      exists,
    } satisfies CacheEntry,
    TTL_SECONDS,
  )

  return exists
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
  const cached = await get<CacheEntry>(cacheKeyFor(slug))
  if (cached) {
    return cached.exists
  }

  const pending = inFlight.get(slug)
  if (pending) {
    return pending
  }

  const query = queryPageSlugExists(slug).finally(() => {
    inFlight.delete(slug)
  })
  inFlight.set(slug, query)

  return query
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
