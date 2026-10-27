import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@website/lib/generateContentPath'
import { CollectionSlug } from '@website/types/collections'
import type { BlogPostData } from '@website/types/payload'

import { revalidateCollectionChange } from '@/lib/payloadHooks/revalidate'

export const revalidateBlogPost: CollectionAfterChangeHook<BlogPostData> = ({
  doc,
  context,
  previousDoc,
  req: { payload },
}) => {
  if (context.skipRevalidate) return doc

  const setUnpublished = previousDoc._status === 'published' && doc._status !== 'published'
  const setNewSlug = previousDoc.slug !== doc.slug

  // Both revalidate calls throw outside a Next context (e.g. a scheduled
  // publish run by the standalone jobs worker) — see
  // revalidateLatestResumeDocument. That must not fail the write itself.
  try {
    if (doc._status === 'published') {
      const path = generateContentPath(CollectionSlug.BlogPosts, doc.slug)

      payload.logger.info(`Revalidating post at path: ${path}`)

      revalidatePath(path)
    }

    if (setNewSlug || setUnpublished) {
      const oldPath = generateContentPath(CollectionSlug.BlogPosts, previousDoc.slug)

      payload.logger.info(`Revalidating old post at path: ${oldPath}`)

      revalidatePath(oldPath)
    }

    if (doc._status === 'published' || setUnpublished) {
      // listings, the RSS feed and the sitemap all cache post queries under
      // this tag; per-path revalidation above does not reach them
      revalidateTag(CollectionSlug.BlogPosts, 'max')
    }
  } catch {
    // No Next context to revalidate from — cached reads pick the change up
    // once their cacheLife expires.
  }

  // The frontend keeps its own copy of the blog listings and feeds, cached
  // under the same tags, and it cannot see this backend's cache. Tell it to
  // drop its entries too.
  if (doc._status === 'published' || setUnpublished || setNewSlug) {
    void revalidateCollectionChange(payload, {
      collection: CollectionSlug.BlogPosts,
      id: String(doc.id),
    })
  }

  return doc
}
