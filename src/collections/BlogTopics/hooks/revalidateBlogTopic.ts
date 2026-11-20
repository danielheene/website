import type { CollectionAfterChangeHook } from 'payload'

import { FEATURED_TOPICS_TAG } from '@/lib/blog/featuredTopics'
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
    // topic lookups and the sitemap cache under the topics tag; post pages
    // populate their topics, and the featured-topics navigation lists them
    tags: [CollectionSlug.BlogTopics, CollectionSlug.BlogPosts, FEATURED_TOPICS_TAG],
    paths: [path],
  })

  return doc
}
