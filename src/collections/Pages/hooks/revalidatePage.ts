import type { CollectionAfterChangeHook } from 'payload'

import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'

export const toPagePath = (slug: string) => (slug === 'home' ? '/' : `/${slug}`)

export const revalidatePage: CollectionAfterChangeHook<Page> = async ({
  doc,
  previousDoc,
  req: { context, payload },
}) => {
  if (context.skipRevalidate) return doc

  const paths: string[] = []

  if (doc._status === 'published') {
    paths.push(toPagePath(doc.slug))
  }

  if (previousDoc?._status === 'published' && doc._status !== 'published') {
    paths.push(toPagePath(previousDoc.slug))
  }

  payload.logger.info(`Revalidating pages: ${paths.join(', ') || '(tag only)'}`)

  await revalidateCache({
    // the sitemap caches page queries under this tag
    tags: [CollectionSlug.Pages],
    paths,
  })

  return doc
}
