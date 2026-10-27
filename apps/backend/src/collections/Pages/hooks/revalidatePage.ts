import { revalidatePath, revalidateTag } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

import { CollectionSlug } from '@website/types/collections'
import type { Page } from '@website/types/payload'

import { invalidatePageSlugCache } from '@/lib/pages/pageSlugCache'
import { revalidateCollectionChange } from '@/lib/payloadHooks/revalidate'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (context.skipRevalidate) return doc

  void invalidatePageSlugCache()

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

  // The frontend renders the same pages from its own cached copies and cannot
  // see this backend's cache, so it needs to drop its entries too.
  void revalidateCollectionChange(payload, {
    collection: CollectionSlug.Pages,
    id: String(doc.id),
  })

  return doc
}
