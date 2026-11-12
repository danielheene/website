import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, CollectionSlug } from '@/types/collections'

/**
 * Fetches a raw page document by its slug, optionally including draft content, and reduces localized data to the requested bilingual language.
 *
 * @param slug - The page slug to search for.
 * @param draft - Whether to include draft content in the lookup.
 * @param locale - The bilingual language used to reduce localized page data.
 * @return The resolved page collection data when found, or null if no matching page exists or an error occurs.
 */
async function fetchPageBySlugRaw(
  slug: string,
  draft: boolean,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['Pages']> | null> {
  const payload = await getPayload({
    config,
  })

  try {
    const {
      docs: [doc],
    } = await payload.find({
      collection: CollectionSlug.Pages,
      overrideAccess: true,
      draft,
      limit: 1,
      where: {
        and: [
          {
            slug: {
              equals: slug,
            },
          },
          // Preview reads the newest version whatever its status: a published
          // document without a pending draft has no 'draft' version to match.
          ...(draft
            ? []
            : [
                {
                  or: [
                    {
                      _status: {
                        equals: 'published' as const,
                      },
                    },
                    {
                      _status: {
                        exists: false,
                      },
                    },
                  ],
                },
              ]),
        ],
      },
    })

    if (!doc) return null

    return resolveRelations(reduceDataToBilingualLanguage(doc, locale))
  } catch (error) {
    console.error('[fetchPageBySlugRaw]', extractErrorMessage(error))

    return null
  }
}

/**
 * Fetches a page by its slug and locale using the configured cache.
 *
 * The cached result is tagged by the pages collection and the specific page slug,
 * allowing cache invalidation for either the full collection or an individual page.
 *
 * @param slug - The unique slug of the page to fetch.
 * @param locale - The language locale used to retrieve the localized page data.
 * @return The matching page collection data, or null if no page is found.
 */
async function fetchPageBySlugCached(
  slug: string,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['Pages']> | null> {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.Pages, `${CollectionSlug.Pages}:${slug}`)

  return fetchPageBySlugRaw(slug, false, locale)
}

/**
 * Fetches a page by its slug, optionally retrieving the draft version and using the specified locale.
 *
 * @param params - The parameters used to fetch the page.
 * @param params.slug - The slug of the page to fetch.
 * @param params.draft - Whether to fetch the draft version of the page.
 * @param params.locale - The locale to use when fetching the page.
 * @return A promise that resolves to the matching page data, or null if no page is found.
 */
export async function fetchPageBySlug({
  slug,
  draft = false,
  locale = 'en',
}: {
  slug: string
  draft?: boolean
  locale?: BilingualLanguage
}): Promise<CollectionData<CollectionSlug['Pages']> | null> {
  if (draft) {
    return fetchPageBySlugRaw(slug, true, locale)
  }

  return fetchPageBySlugCached(slug, locale)
}
