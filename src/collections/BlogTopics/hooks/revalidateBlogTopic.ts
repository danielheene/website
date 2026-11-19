import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionData, CollectionSlug } from '@/types/collections'

export const revalidateBlogTopic: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['BlogTopics']>
> = async ({ doc, context, req: { payload } }) => {
  if (context.skipRevalidate) return doc

  const path = generateContentPath(CollectionSlug.BlogTopics, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  await revalidateCache({
    // topic lookups and the sitemap cache under this tag
    tags: [CollectionSlug.BlogTopics],
    paths: [path],
  })

  return doc
}
