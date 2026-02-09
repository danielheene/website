import { generateContentPath } from '@/utilities/generateContentURL'
import { CollectionSlug, GlobalSlug } from '@custom-types'
import { PageLayout } from '@payload-types'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateResumeSection =
  (slug: GlobalSlug): GlobalAfterChangeHook =>
  async ({ doc, req: { payload } }) => {
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
