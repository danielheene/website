import type { Payload } from 'payload'

import { BLOG_PATH } from '@/lib/blog/listing'
import { latestTimestamp as latest } from '@/lib/latestTimestamp'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionSlug } from '@/types/collections'

import { documentPath } from './paths'

export interface RouteEntry {
  /** Listed in the sitemap. Routable but unlisted paths (empty topics) set this to false. */
  indexable: boolean
  lastModified?: string
}

export type RouteIndex = Record<string, RouteEntry>

export const LATEST_RESUME_PATH = '/resume/latest'

/** The `/resume/[slug]` value that renders the document validator instead of a document. */
export const RESUME_VALIDATE_SLUG = 'validate'

export const RESUME_VALIDATE_PATH = `/resume/${RESUME_VALIDATE_SLUG}`

const entry = (indexable: boolean, ...dates: (string | null | undefined)[]): RouteEntry => {
  const lastModified = latest(...dates)

  return lastModified ? { indexable, lastModified } : { indexable }
}

const published = {
  _status: {
    equals: 'published',
  },
} as const

/**
 * Every path the frontend serves outside its static files: published pages,
 * topics and posts, every résumé document, and the routes without a document
 * of their own. Shared by the sitemap (the indexable entries) and the proxy
 * (any entry), so the two cannot disagree on which URLs exist.
 */
export const buildRouteIndex = async (payload: Payload): Promise<RouteIndex> => {
  const query = { pagination: false, limit: 0, depth: 0, overrideAccess: true } as const

  const [pages, posts, topics, resumes] = await Promise.all([
    payload.find({
      collection: CollectionSlug.Pages,
      ...query,
      draft: false,
      where: published,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: CollectionSlug.BlogPosts,
      ...query,
      draft: false,
      where: published,
      select: { slug: true, updatedAt: true, topics: true },
    }),
    payload.find({
      collection: CollectionSlug.BlogTopics,
      ...query,
      draft: false,
      where: published,
      select: { slug: true, updatedAt: true },
    }),
    payload.find({
      collection: CollectionSlug.ResumeDocuments,
      ...query,
      // no automatic timestamps; `createdAt` is a field of its own
      select: { slug: true, createdAt: true },
    }),
  ])

  const index: RouteIndex = {}

  for (const { slug, updatedAt } of pages.docs) {
    if (slug) index[documentPath(CollectionSlug.Pages, slug)] = entry(true, updatedAt)
  }

  // newest post update per topic id; at depth 0 a relation holds the bare id
  const topicUpdatedAt = new Map<string, string | undefined>()

  for (const { slug, updatedAt, topics: postTopics } of posts.docs) {
    if (!slug) continue

    index[documentPath(CollectionSlug.BlogPosts, slug)] = entry(true, updatedAt)

    for (const { value } of postTopics ?? []) {
      const id = String(value)

      topicUpdatedAt.set(id, latest(topicUpdatedAt.get(id), updatedAt))
    }
  }

  // the static listing shadows a page slugged `blog`
  index[BLOG_PATH] = entry(true, ...posts.docs.map(({ updatedAt }) => updatedAt))

  for (const { id, slug, updatedAt } of topics.docs) {
    if (!slug || RESERVED_TOPIC_SLUGS.includes(slug)) continue

    // an empty topic renders "No posts published yet": routable, not worth indexing
    index[documentPath(CollectionSlug.BlogTopics, slug)] = entry(
      topicUpdatedAt.has(id),
      updatedAt,
      topicUpdatedAt.get(id),
    )
  }

  for (const { slug, createdAt } of resumes.docs) {
    if (slug) index[documentPath(CollectionSlug.ResumeDocuments, slug)] = entry(true, createdAt)
  }

  if (resumes.docs.length > 0) {
    index[LATEST_RESUME_PATH] = entry(true, ...resumes.docs.map(({ createdAt }) => createdAt))
  }

  index[RESUME_VALIDATE_PATH] = entry(true)

  return index
}
