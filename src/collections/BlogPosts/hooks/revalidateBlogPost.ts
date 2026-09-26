import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData } from '@/types/payload'

export const revalidateBlogPost: CollectionAfterChangeHook<BlogPostData> = ({
  doc,
  context,
  previousDoc,
  req: { payload },
}) => {
  if (context.skipRevalidate) return doc

  if (doc._status === 'published') {
    const path = generateContentPath(CollectionSlug.BlogPosts, doc.slug)

    payload.logger.info(`Revalidating post at path: ${path}`)

    revalidatePath(path)
  }

  const setUnpublished = previousDoc._status === 'published' && doc._status !== 'published'
  const setNewSlug = previousDoc.slug !== doc.slug

  if (setNewSlug || setUnpublished) {
    const oldPath = generateContentPath(CollectionSlug.BlogPosts, previousDoc.slug)

    payload.logger.info(`Revalidating old post at path: ${oldPath}`)

    revalidatePath(oldPath)
  }

  if (doc._status === 'published' || setUnpublished) {
    // listings, the RSS feed and the sitemap all cache post queries under
    // this tag; per-path revalidation above does not reach them
    try {
      revalidateTag(CollectionSlug.BlogPosts, 'max')
    } catch {
      // No Next context (e.g. a scheduled publish run by the standalone jobs
      // worker) — see revalidateLatestResumeDocument for the full story.
    }
  }

  return doc
}
