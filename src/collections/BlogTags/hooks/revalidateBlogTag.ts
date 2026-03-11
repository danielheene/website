import { CollectionSlug } from '@custom-types'
import type { BlogTag } from '@payload-types'
import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'

export const revalidateBlogTag: CollectionAfterChangeHook<BlogTag> = ({ doc, context, req: { payload } }) => {
  if (context.skipRevalidate) return doc

  const path = generateContentPath(CollectionSlug.BlogTags, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
