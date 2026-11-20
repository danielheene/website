import type { CollectionAfterChangeHook, CollectionAfterDeleteHook } from 'payload'

import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'

/**
 * Pages, posts and topics cache their media populated (url, alt, credits),
 * and the legal page's credits cache under each media collection's tag. A
 * media change is rare, so it clears all of them rather than tracing which
 * documents embed the file.
 */
const revalidate = (collection: string) =>
  revalidateCache({
    tags: [collection, CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogTopics],
  })

export const revalidateMediaUsageHooks = (collection: string) => {
  const afterChange: CollectionAfterChangeHook = async ({ doc, context }) => {
    if (!context.skipRevalidate) await revalidate(collection)

    return doc
  }

  const afterDelete: CollectionAfterDeleteHook = async ({ doc, context }) => {
    if (!context.skipRevalidate) await revalidate(collection)

    return doc
  }

  return {
    afterChange,
    afterDelete,
  }
}
