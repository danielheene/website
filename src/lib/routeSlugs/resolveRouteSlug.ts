import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionSlug } from '@/types/collections'

export type RouteCollection =
  | CollectionSlug['Pages']
  | CollectionSlug['BlogTopics']
  | CollectionSlug['BlogPosts']
  | CollectionSlug['ResumeDocuments']

export interface RouteSlug {
  collection: RouteCollection
  slug: string
}

/** The path the proxy rewrites unknown slugs to; its page 404s while prerendering. */
export const NOT_FOUND_PATH = '/404'

// First segments that belong to their own routes, not to a CMS page.
const RESERVED_FIRST_SEGMENTS = new Set([
  '404',
  '_next',
  'admin',
  'api',
  'blog',
  'download',
  'next',
  'resume',
])

/** Slug segments never contain a dot, so anything with one is a file. */
const isSlugSegment = (segment: string) => segment !== '' && !segment.includes('.')

/**
 * Maps a pathname to the document its dynamic route renders, or null when the
 * path is not one of those routes (the home page, files, API and admin routes,
 * static routes, deeper paths).
 *
 * `blog/post` is answered with a topic slug no topic can have, so the reserved
 * slug 404s like any other unknown one.
 */
export const resolveRouteSlug = (pathname: string): RouteSlug | null => {
  const segments = pathname.replace(/^\/+|\/+$/g, '').split('/')

  if (!segments.every(isSlugSegment)) return null

  const [first, second, third] = segments

  switch (segments.length) {
    case 1:
      return RESERVED_FIRST_SEGMENTS.has(first)
        ? null
        : { collection: CollectionSlug.Pages, slug: first }

    case 2:
      if (first === 'blog') return { collection: CollectionSlug.BlogTopics, slug: second }

      if (first === 'resume') return { collection: CollectionSlug.ResumeDocuments, slug: second }

      return null

    case 3:
      return first === 'blog' && second === 'post'
        ? { collection: CollectionSlug.BlogPosts, slug: third }
        : null

    default:
      return null
  }
}

/** Slugs that a route serves without a document of that name. */
export const isVirtualSlug = ({ collection, slug }: RouteSlug): boolean =>
  collection === CollectionSlug.ResumeDocuments && slug === 'latest'

/** Slugs that a route always rejects, whatever is stored. */
export const isReservedSlug = ({ collection, slug }: RouteSlug): boolean =>
  collection === CollectionSlug.BlogTopics && RESERVED_TOPIC_SLUGS.includes(slug)
