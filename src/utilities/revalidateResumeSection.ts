import { CollectionSlug, type GlobalSlug } from '@custom-types'
import type { PageLayout } from '@payload-types'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'

export const revalidateResumeSection =
  (slug: GlobalSlug): GlobalAfterChangeHook =>
    async ({ doc, context, req: { payload } }) => {
      if (context.skipRevalidate) return doc

      if ('_status' in doc && doc._status !== 'published') return

      payload.logger.info(`Revalidating Resume Section: ${doc.label}`)
      revalidateTag(slug)

      const { docs } = await payload.find({
        collection: CollectionSlug.Pages,
        draft: false,
        limit: 9999,
        where: {
          layout: {
            equals: 'resume' satisfies PageLayout,
          },
        },
        select: {
          slug: true,
        },
      })

      docs.forEach(({ slug }) => {
        const path = generateContentPath(CollectionSlug.Pages, slug)
        payload.logger.info(`Revalidating Page: ${path}`)
        revalidatePath(path)
      })

      return doc
    }
