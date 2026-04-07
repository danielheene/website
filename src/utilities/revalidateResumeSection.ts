import { CollectionSlug, type GlobalSlug } from '@custom-types'
import type { PageLayout } from '@payload-types'
import { revalidatePath, revalidateTag } from 'next/cache'
import type { GlobalAfterChangeHook } from 'payload'

import { generateContentPath } from '@/lib/generateContentPath'
import { logger } from '@/lib/otel/logger'

export const revalidateResumeSection =
  (slug: GlobalSlug): GlobalAfterChangeHook =>
  async ({ doc, context, req: { payload, locale: reqLocale } }) => {
    if (context.skipRevalidate) return doc

    if ('_status' in doc && doc._status !== 'published') return

    const locale = reqLocale === 'de' ? 'de' : 'en'
    payload.logger.info(`Revalidating Resume Section: ${slug} for locale: ${locale}`)
    revalidateTag(slug)

    /**
     * Revalidate all Pages including resumne layouts
     */
    try {
      console.info(`Fetching pages that are using the Resume layout: ${slug} for locale: ${locale}`)
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

      console.info(`Found ${docs.length} pages using the Resume layout for locale: ${locale}`)

      docs.forEach(({ slug }) => {
        console.info(`Revalidating Page: ${slug}`)
        const path = generateContentPath(CollectionSlug.Pages, slug)
        revalidatePath(path)
      })
    } catch (error) {
      console.error(`Failed to revalidate resume section with slug: ${slug} for locale: ${locale}`, error)
    }

    /**
     * Create Resume Document Regeneration
     */
    try {
      const documentEnglish = await payload.jobs.queue({
        task: 'generateResumeDocumentTask',
        queue: 'default',
        input: { locale: 'en' },
      })

      const documentGerman = await payload.jobs.queue({
        task: 'generateResumeDocumentTask',
        queue: 'default',
        input: { locale: 'de' },
      })

      console.info(`Added a new task to the queue to create the most recent resume document with locale: ${locale}`, { locale })
    } catch (error) {
      console.error(`Failed to add task to queue for resume document generation with locale: ${locale}`, error)
    }

    return doc
  }
