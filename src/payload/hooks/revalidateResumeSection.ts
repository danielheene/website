import { generateContentPath } from '@/utilities/generateContentURL'
import { CollectionSlug, GlobalSlug } from '@custom-types'
import { PageLayout } from '@payload-types'
import { snakeCase } from 'lodash-es'

import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

export const revalidateResumeSection =
  (slug: GlobalSlug): GlobalAfterChangeHook =>
  async ({ doc, req: { payload }, context: { isSeedContext } }) => {
    if ('_status' in doc && doc._status !== 'published') return
    if (!isSeedContext) payload.logger.info(`Revalidating ${doc.label} Section`)

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
      revalidatePath(path)
    })

    revalidateTag(snakeCase(slug))

    return doc
  }
