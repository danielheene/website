import config from '@payload-config'
import { getPayload } from 'payload'

import { normalizeRedirectPath } from '@/collections/Redirects/hooks/normalizeFromPath'
import { extractErrorMessage } from '@/lib/extractErrorMessage'

import { type ResolvedRedirect, resolveRedirect } from './resolveRedirect'

/** Key prefix for per-path redirect lookups, so the set can be cleared as a group. */
const CACHE_PREFIX = 'redirects:lookup:'

/**
 * Safety net for rows changed without going through the collection hooks (a
 * direct DB write, a restored dump). Hook-driven invalidation is what normally
 * keeps this fresh, so the window can be generous.
 */
const TTL_MS = 5 * 60 * 1000

const cacheKeyFor = (pathname: string): string =>
  `${CACHE_PREFIX}${normalizeRedirectPath(pathname)}`

interface CacheEntry {
  /** Null is cached too: "no redirect here" is the common case and the one worth skipping the DB for. */
  redirect: ResolvedRedirect | null
  expiresAt: number
}

/**
 * Resolves a redirect for `pathname`, memoizing the result — including misses —
 * in the KV store.
 *
 * `proxy.ts` calls this on every request that reaches the redirect stage, so
 * the miss path is the hot one: without caching negatives, each request for a
 * path with no redirect would still cost a query.
 */
export const fetchRedirect = async (pathname: string): Promise<ResolvedRedirect | null> => {
  const payload = await getPayload({
    config,
  })

  const cacheKey = cacheKeyFor(pathname)
  const cached = await payload.kv.get<CacheEntry>(cacheKey)

  if (cached && cached.expiresAt > Date.now()) {
    return cached.redirect
  }

  const redirect = await resolveRedirect({
    payload,
    pathname,
  })

  await payload.kv.set(cacheKey, {
    redirect,
    expiresAt: Date.now() + TTL_MS,
  } satisfies CacheEntry)

  return redirect
}

/**
 * Drops every cached lookup.
 *
 * Entries are keyed by requested path while rows are keyed by `from`, and a
 * chained or document-backed redirect can change the destination for paths that
 * never name the edited row — so a single edit cannot be mapped back to the
 * exact keys it affects. Clearing the prefix keeps correctness; the set is
 * small and refills on demand.
 */
export const invalidateRedirectCache = async (): Promise<void> => {
  const payload = await getPayload({
    config,
  })

  try {
    const keys = await payload.kv.keys()
    await Promise.all(
      keys.filter((key) => key.startsWith(CACHE_PREFIX)).map((key) => payload.kv.delete(key)),
    )
  } catch (error) {
    console.error('Failed to invalidate redirect cache:', extractErrorMessage(error))
  }
}
