import { CollectionSlug } from '@/types/collections'

import { OG_IMAGE_PATH } from './constants'

export const OG_COLLECTIONS = [
  CollectionSlug.Pages,
  CollectionSlug.BlogPosts,
  CollectionSlug.BlogTopics,
  CollectionSlug.ResumeDocuments,
] as const

export type OgCollection = (typeof OG_COLLECTIONS)[number]

/** What an Open Graph image depicts: one document, or the blog listing. */
export type OgTarget =
  | {
      collection: OgCollection
      slug: string
    }
  | {
      listing: 'blog'
    }

const HOME: OgTarget = {
  collection: CollectionSlug.Pages,
  slug: 'home',
}

const isOgCollection = (value: string): value is OgCollection =>
  OG_COLLECTIONS.some((collection) => collection === value)

/** Maps a site path to the document it shows, mirroring the frontend routes. */
export const ogTargetFromPath = (path: string): OgTarget | null => {
  const segments = path.split(/[?#]/)[0].split('/').filter(Boolean)

  if (segments.length === 0) return HOME

  const [first, second, third, ...rest] = segments

  if (rest.length > 0) return null

  if (first === 'blog') {
    if (!second)
      return {
        listing: 'blog',
      }

    if (second === 'post')
      return third
        ? {
            collection: CollectionSlug.BlogPosts,
            slug: third,
          }
        : null

    return third
      ? null
      : {
          collection: CollectionSlug.BlogTopics,
          slug: second,
        }
  }

  if (first === 'resume' && second)
    return third
      ? null
      : {
          collection: CollectionSlug.ResumeDocuments,
          slug: second,
        }

  return second
    ? null
    : {
        collection: CollectionSlug.Pages,
        slug: first,
      }
}

/**
 * Reads the route's query: `path` (a site path such as `/blog/post/my-post`),
 * or `collection` with `slug`. Pages default to the home page without a slug.
 */
export const ogTargetFromSearchParams = (params: URLSearchParams): OgTarget | null => {
  const path = params.get('path')

  if (path !== null) return ogTargetFromPath(path)

  const collection = params.get('collection')
  const slug = params.get('slug')

  if (!collection || !isOgCollection(collection)) return null

  if (slug) return { collection, slug }

  return collection === CollectionSlug.Pages ? HOME : null
}

/**
 * The image URL for a page's metadata, relative to `metadataBase`. `version`
 * (the document's `updatedAt`) changes the URL whenever the content does, so
 * the long cache lifetime never serves a stale card.
 */
export const ogImageUrl = (target: OgTarget, version?: string | null): string => {
  const params = new URLSearchParams(
    'listing' in target
      ? {
          path: '/blog',
        }
      : {
          collection: target.collection,
          slug: target.slug,
        },
  )

  const time = version ? new Date(version).getTime() : Number.NaN

  if (!Number.isNaN(time)) params.set('v', String(time))

  return `${OG_IMAGE_PATH}?${params}`
}
