import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionData, CollectionSlug } from '@/types/collections'

export const revalidateBlogTopic: CollectionAfterChangeHook<
  CollectionData<CollectionSlug['BlogTopics']>
> = ({ doc, context, req: { payload } }) => {
  if (context.skipRevalidate) return doc

  // Revalidation throws outside a Next context — see
  // revalidateLatestResumeDocument. That must not fail the write itself.
  try {
    const path = generateContentPath(CollectionSlug.BlogTopics, doc.slug)
    payload.logger.info(`Revalidating page at path: ${path}`)

    revalidatePath(path)

    // topic lookups and the sitemap cache under this tag
    revalidateTag(CollectionSlug.BlogTopics, 'max')
  } catch {
    // No Next context to revalidate from — cached reads pick the change up
    // once their cacheLife expires.
  }

  return doc
}
