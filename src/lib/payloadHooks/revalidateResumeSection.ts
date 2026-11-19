import type {
  CollectionAfterChangeHook,
  GlobalAfterChangeHook,
  PayloadRequest,
  RequestContext,
} from 'payload'

import { RESUME_PAGE_SLUG } from '@/collections/Pages/constants'
import { generateContentPath } from '@/lib/generateContentPath'
import { revalidateCache } from '@/lib/revalidation/revalidateCache'
import { CollectionSlug } from '@/types/collections'
import type { GlobalSlugValue } from '@/types/globals'

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

  // The resume page renders this section, so it goes stale with it.
  let paths: string[] = []

  try {
    const { docs } = await payload.find({
      collection: CollectionSlug.Pages,
      draft: false,
      limit: 9999,
      where: {
        slug: {
          equals: RESUME_PAGE_SLUG,
        },
      },
      select: {
        slug: true,
      },
    })

    paths = docs.map(({ slug }) => generateContentPath(CollectionSlug.Pages, slug))
  } catch (error) {
    console.error(`Failed to find resume pages for section: ${slug}`, error)
  }

  await revalidateCache({
    tags: [slug],
    paths,
    profile: 'immediate',
  })

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
