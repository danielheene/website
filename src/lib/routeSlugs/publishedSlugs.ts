import config from '@payload-config'
import { getPayload } from 'payload'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { get, invalidate, set } from '@/lib/RedisHandler'
import { CollectionSlug } from '@/types/collections'

import type { RouteCollection } from './resolveRouteSlug'

const CACHE_PREFIX = 'route-slugs:'

/**
 * Safety net for changes that bypass the collection hooks (direct database
 * writes, restored dumps); the hooks clear the key on every change and delete.
 */
const TTL_SECONDS = 5 * 60

const cacheKeyFor = (collection: RouteCollection) => `${CACHE_PREFIX}${collection}`

/** Résumé documents have no drafts; everything else is only routable once published. */
const publishedFilter = (collection: RouteCollection) =>
  collection === CollectionSlug.ResumeDocuments
    ? {}
    : {
        where: {
          _status: {
            equals: 'published' as const,
          },
        },
      }

/**
 * Every slug a collection's route can serve, from Redis or, on a miss, one
 * query that selects nothing but the slugs.
 */
export const fetchPublishedSlugs = async (collection: RouteCollection): Promise<string[]> => {
  const cached = await get<string[]>(cacheKeyFor(collection))

  if (cached) return cached

  const payload = await getPayload({
    config,
  })

  const { docs } = await payload.find({
    collection,
    ...publishedFilter(collection),
    select: {
      slug: true,
    },
    pagination: false,
    limit: 0,
    depth: 0,
    draft: false,
    // the proxy has no user; this only reveals which slugs are published
    overrideAccess: true,
  })

  const slugs = docs.map(({ slug }) => slug).filter(Boolean)

  await set(cacheKeyFor(collection), slugs, TTL_SECONDS)

  return slugs
}

/** Drops a collection's cached slugs. Never throws: a failed clear only delays the update. */
export const invalidatePublishedSlugs = async (collection: RouteCollection): Promise<void> => {
  try {
    await invalidate(cacheKeyFor(collection))
  } catch (error) {
    console.error(`Failed to invalidate ${collection} slugs:`, extractErrorMessage(error))
  }
}
