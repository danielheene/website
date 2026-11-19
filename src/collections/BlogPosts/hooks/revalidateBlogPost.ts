import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData } from '@/types/payload'

export const revalidateBlogPost: CollectionAfterChangeHook<BlogPostData> = async ({
  doc,
  context,
  previousDoc,
  req: { payload },
}) => {
  if (context.skipRevalidate) return doc

  const setUnpublished = previousDoc._status === 'published' && doc._status !== 'published'
  const setNewSlug = previousDoc.slug !== doc.slug

  const paths: string[] = []

  if (doc._status === 'published') {
    paths.push(generateContentPath(CollectionSlug.BlogPosts, doc.slug))
  }

  if (setNewSlug || setUnpublished) {
    paths.push(generateContentPath(CollectionSlug.BlogPosts, previousDoc.slug))
  }

  // listings, the RSS feed and the sitemap all cache post queries under this
  // tag; per-path revalidation does not reach them
  const tags = doc._status === 'published' || setUnpublished ? [CollectionSlug.BlogPosts] : []

  if (paths.length > 0) payload.logger.info(`Revalidating posts: ${paths.join(', ')}`)

  await revalidateCache({
    tags,
    paths,
  })

  return doc
}
