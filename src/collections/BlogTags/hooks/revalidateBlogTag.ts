import { generateContentPath } from '@/utilities/generateContentURL'
import { CollectionSlug } from '@custom-types'

import type { BlogTag } from '@payload-types'

import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateBlogTag: CollectionAfterChangeHook<BlogTag> = ({ doc, req: { payload } }) => {
  const path = generateContentPath(CollectionSlug.BlogTags, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
