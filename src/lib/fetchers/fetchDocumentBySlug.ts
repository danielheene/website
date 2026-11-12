import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, CollectionSlug } from '@/types/collections'

/**
 * Fetches a resume document by its slug, optionally resolving the special "latest" slug to the most recently created document.
 * Returns the document reduced to the requested bilingual language with relations resolved, or null if no document is found or an error occurs.
 *
 * @param slug - The document slug to fetch. Use "latest" to fetch the most recently created resume document.
 * @param draft - Whether to include draft document data when querying the collection.
 * @param locale - The bilingual language used to reduce localized document data.
 * @return The resolved resume document collection data, or null if the document cannot be found or fetched.
 */
async function fetchDocumentBySlugRaw(
  slug: string,
  draft: boolean,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['ResumeDocuments']> | null> {
  const payload = await getPayload({
    config,
  })

  let realSlug: string = slug

  if (slug === 'latest') {
    try {
      const {
        docs: [latestDoc],
      } = await payload.find({
        collection: CollectionSlug.ResumeDocuments,
        overrideAccess: true,
        draft,
        limit: 1,
        sort: '-createdAt',
      })

      if (latestDoc && latestDoc.slug) {
        realSlug = latestDoc.slug
      }
    } catch (error) {
      console.error('[fetchDocumentBySlugRaw]', extractErrorMessage(error))
    }
  }

  try {
    const {
      docs: [doc],
    } = await payload.find({
      collection: CollectionSlug.ResumeDocuments,
      overrideAccess: true,
      draft,
      limit: 1,
      // No `_status` filter: the collection has no drafts, and Payload rejects the path.
      where: {
        slug: {
          equals: realSlug,
        },
      },
    })

    if (!doc) return null

    return resolveRelations(reduceDataToBilingualLanguage(doc, locale))
  } catch (error) {
    console.error('[fetchDocumentBySlugRaw]', extractErrorMessage(error))

    return null
  }
}

/**
 * Fetches a cached resume document by its slug and locale.
 *
 * @param slug - The unique slug identifying the resume document.
 * @param locale - The bilingual language used to reduce localized document data.
 */
async function fetchDocumentBySlugCached(
  slug: string,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['ResumeDocuments']> | null> {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.ResumeDocuments, `${CollectionSlug.ResumeDocuments}:${slug}`)

  return fetchDocumentBySlugRaw(slug, false, locale)
}

/**
 * Fetches a resume document by its slug, optionally resolving the special "latest" slug to the most recently created document.
 * Returns the document reduced to the requested bilingual language with relations resolved, or null if no document is found or an error occurs.
 *
 * @param slug - The document slug to fetch. Use "latest" to fetch the most recently created resume document.
 * @param draft - Whether to include draft document data when querying the collection.
 * @param locale - The bilingual language used to reduce localized document data.
 * @return The resolved resume document collection data, or null if the document cannot be found or fetched.
 */
export async function fetchDocumentBySlug({
  slug,
  draft = false,
  locale = 'en',
}: {
  slug: string
  draft?: boolean
  locale?: BilingualLanguage
}): Promise<CollectionData<CollectionSlug['ResumeDocuments']> | null> {
  if (draft) {
    return fetchDocumentBySlugRaw(slug, true, locale)
  }

  return fetchDocumentBySlugCached(slug, locale)
}
