import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionData, CollectionSlug } from '@/types/collections'

export const revalidateBlogTopic: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['BlogTopics']>
> = ({ doc, context, req: { payload } }) => {
  if (context.skipRevalidate) return doc

  const path = generateContentPath(CollectionSlug.BlogTopics, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
