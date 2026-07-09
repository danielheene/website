import { CollectionSlug } from '@/types/collections'
import type { BlogTag } from '@/types/payload'
import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'

export const revalidateBlogTag: CollectionAfterChangeHook<BlogTag> = ({ doc, context, req: { payload } }) => {
  if (context.skipRevalidate) return doc

  const path = generateContentPath(CollectionSlug['BlogTags'], doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
