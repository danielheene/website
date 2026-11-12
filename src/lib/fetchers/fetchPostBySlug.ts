import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { BilingualLanguage, reduceDataToBilingualLanguage } from '@/lib/i18n'
import { resolveRelations } from '@/lib/resolveRelation'
import { CollectionData, CollectionSlug } from '@/types/collections'

async function fetchPostBySlugRaw(
  slug: string,
  draft: boolean,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['BlogPosts']> | null> {
  const payload = await getPayload({
    config,
  })

  try {
    const {
      docs: [doc],
    } = await payload.find({
      collection: CollectionSlug.BlogPosts,
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
    console.error('[fetchPostBySlugRaw]', extractErrorMessage(error))

    return null
  }
}

async function fetchPostBySlugCached(
  slug: string,
  locale: BilingualLanguage,
): Promise<CollectionData<CollectionSlug['BlogPosts']> | null> {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogPosts, `${CollectionSlug.BlogPosts}:${slug}`)

  return fetchPostBySlugRaw(slug, false, locale)
}

export async function fetchPostBySlug({
  slug,
  draft = false,
  locale = 'en',
}: {
  slug: string
  draft?: boolean
  locale?: BilingualLanguage
}): Promise<CollectionData<CollectionSlug['BlogPosts']> | null> {
  if (draft) {
    return fetchPostBySlugRaw(slug, true, locale)
  }

  return fetchPostBySlugCached(slug, locale)
}
