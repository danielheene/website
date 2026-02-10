import { generateContentPath } from '@/utilities/generateContentURL'
import { CollectionSlug } from '@custom-types'

import type { BlogPost } from '@payload-types'

import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateBlogPost: CollectionAfterChangeHook<BlogPost> = ({ doc, context, previousDoc, req: { payload } }) => {
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

  return doc
}
