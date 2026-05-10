import type { Page } from '@/types/payload'
import { revalidatePath } from 'next/cache'
import type { CollectionAfterChangeHook } from 'payload'

export const revalidatePage: CollectionAfterChangeHook<Page> = ({ doc, previousDoc, req: { context, payload } }) => {
  if (context.skipRevalidate) return doc

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

  return doc
}
