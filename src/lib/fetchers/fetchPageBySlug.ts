import { cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { reduceDataToBilingualLanguage, BilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, CollectionSlug } from '@/types/collections'

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
        slug: {
          equals: slug,
        },
      },
    })

    if (!doc) return null

    return resolveRelations(reduceDataToBilingualLanguage(doc, locale))
  } catch (error) {
    console.error('[fetchPageBySlugRaw]', error)

    return null
  }
}

async function fetchPageBySlugCached(
  slug: string,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['Pages']> | null> {
  'use cache'
  cacheTag(CollectionSlug.Pages, `${CollectionSlug.Pages}:${slug}`)

  return fetchPageBySlugRaw(slug, false, locale)
}

export async function fetchPageBySlug({
  slug,
  draft = false,
  locale = 'de',
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
