import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (context.skipRevalidate) return doc

  // Revalidation throws outside a Next context (e.g. a scheduled publish run
  // by the standalone jobs worker) — see revalidateLatestResumeDocument. That
  // must not fail the write itself.
  try {
    if (doc._status && doc._status === 'published') {
      const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
      payload.logger.info(`Revalidating page at path: ${path}`)
      revalidatePath(path)
    }

    if (previousDoc?._status === 'published' && doc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`
      payload.logger.info(`Revalidating old page at path: ${oldPath}`)
      revalidatePath(oldPath)
    }

    // the sitemap caches page queries under this tag
    revalidateTag(CollectionSlug.Pages, 'max')
  } catch {
    // No Next context to revalidate from — cached reads pick the change up
    // once their cacheLife expires.
  }

  return doc
}
