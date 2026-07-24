import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'
import type { BlogTopic } from '@/types/payload'

export const revalidateBlogTopic: CollectionAfterChangeHook<BlogTopic> = ({
  doc,
  context,
  req: { payload },
}) => {
  if (context.skipRevalidate) return doc

  const path = generateContentPath(CollectionSlug.BlogTopics, doc.slug)
  payload.logger.info(`Revalidating page at path: ${path}`)

  revalidatePath(path)

  return doc
}
