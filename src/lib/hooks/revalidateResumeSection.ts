import { revalidatePath, revalidateTag } from 'next/cache'
import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
  RequestContext,
} from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug, CollectionSlugValue } from '@/types/collections'
import type { GlobalSlugValue } from '@/types/globals'
import type { PageLayout } from '@/types/payload'

interface RevalidateResumeSectionHookOptions {
  doc: any
  context: RequestContext
  req: PayloadRequest
  slug: GlobalSlugValue
}

const revalidateResumeSection = async ({
  doc,
  context,
  req: { payload },
  slug,
}: RevalidateResumeSectionHookOptions) => {
  if (process.env.CI) return doc
  if (context.skipRevalidate) return doc

  if ('_status' in doc && doc._status !== 'published') return

  payload.logger.info(`Revalidating Resume Section: ${slug}`)
  revalidateTag(slug, {
    expire: 0,
  })

  /**
   * Revalidate all Pages including resumne layouts
   */
  try {
    console.info(`Fetching pages that are using the Resume layout: ${slug}`)
    const { docs } = await payload.find({
      collection: CollectionSlug['Pages'],
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

    console.info(`Found ${docs.length} pages using the Resume layout`)

    docs.forEach(({ slug }) => {
      console.info(`Revalidating Page: ${slug}`)
      const path = generateContentPath(CollectionSlug['Pages'], slug)
      revalidatePath(path)
    })
  } catch (error) {
    console.error(`Failed to revalidate resume section with slug: ${slug}`, error)
  }

  return doc
}

export const revalidateResumeSectionCollectionHook =
  (slug: GlobalSlugValue): CollectionAfterChangeHook =>
  async ({ doc, context, req }) => {
    return await revalidateResumeSection({
      doc,
      context,
      req,
      slug,
    })
  }

export const revalidateResumeSectionGlobalHook =
  (slug: GlobalSlugValue): GlobalAfterChangeHook =>
  async ({ doc, context, req }) => {
    return await revalidateResumeSection({
      doc,
      context,
      req,
      slug,
    })
  }
