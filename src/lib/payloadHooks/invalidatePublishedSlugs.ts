import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { invalidatePublishedSlugs } from '@/lib/routeSlugs/publishedSlugs'
import type { RouteCollection } from '@/lib/routeSlugs/resolveRouteSlug'

/**
 * Clears the proxy's slug list after every change and delete, so a new or
 * renamed document stops 404ing at once instead of after the cache expires.
 */
export const invalidatePublishedSlugsHooks = (collection: RouteCollection) => {
  const afterChange: CollectionAfterChangeHook = async ({ doc }) => {
    await invalidatePublishedSlugs(collection)

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc }) => {
    await invalidatePublishedSlugs(collection)

    return doc
  }

  return {
    afterChange,
    afterDelete,
  }
}
