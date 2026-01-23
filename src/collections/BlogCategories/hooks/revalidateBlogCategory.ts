import { generateContentPath } from '@/utilities/generateContentURL'
import { CollectionSlug } from '@custom-types'

import type { BlogCategory } from '@payload-types'

import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidateBlogCategory: CollectionAfterChangeHook<BlogCategory> = ({ doc, req: { payload } }) => {
  const path = generateContentPath(CollectionSlug.BlogCategories, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
