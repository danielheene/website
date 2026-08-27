import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { invalidateRedirectCache } from '@/lib/redirects/redirectCache'

/**
 * Clears the cached lookups after any write, so an edited redirect applies to
 * the next request instead of waiting out the entry's TTL.
 */
export const invalidateRedirectsAfterChange: CollectionAfterChangeHook = async ({ doc }) => {
  await invalidateRedirectCache()
  return doc
}

export const invalidateRedirectsAfterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
  await invalidateRedirectCache()
  return doc
}
