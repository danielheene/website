import { RESERVED_TOPIC_SLUGS } from '@/types/blog'

/**
 *    Blog listing state
 *
 *    Every post listing (/blog and /blog/<topic>) is paginated and sorted via
 *    search params — `?page=<n>` and `?sort=<key>` — rather than dedicated
 *    `/page/<n>` route segments. Everything that reads or writes those params
 *    goes through this module, so the page, the pagination links and the
 *    proxy's URL normalisation cannot disagree on what a valid value is.
 */

/** The unfiltered listing. Use this, not generateContentPath(BlogTopics), which yields `/blog/`. */
export const BLOG_PATH = '/blog'

export const POSTS_PER_PAGE = 12

export const BLOG_PAGE_PARAM = 'page'
export const BLOG_SORT_PARAM = 'sort'

/**
 * Sort orders a listing can be requested in. Each maps to a Payload `sort`
 * value; the secondary keys keep the order stable across pages when the
 * primary key ties (two posts with the same title, say).
 */
export const BLOG_SORT_OPTIONS = {
  newest: {
    label: 'Newest',
    sort: [
      '-createdAt',
      '-id',
    ],
  },
  oldest: {
    label: 'Oldest',
    sort: [
      'createdAt',
      'id',
    ],
  },
  title: {
    label: 'A–Z',
    sort: [
      'title',
      '-createdAt',
      '-id',
    ],
  },
} as const satisfies Record<
  string,
  {
    label: string
    sort: readonly string[]
  }
>

export type BlogSort = keyof typeof BLOG_SORT_OPTIONS

/** Newest first — the order a blog is expected to open in. */
export const DEFAULT_BLOG_SORT: BlogSort = 'newest'

export const BLOG_SORTS = Object.keys(BLOG_SORT_OPTIONS) as BlogSort[]

export interface BlogListingState {
  /** 1-based page number. */
  page: number
  sort: BlogSort
}

type RawParam = string | string[] | undefined

const firstValue = (raw: RawParam): string | undefined => (Array.isArray(raw) ? raw[0] : raw)

export const isBlogSort = (value: unknown): value is BlogSort =>
  typeof value === 'string' && Object.hasOwn(BLOG_SORT_OPTIONS, value)

/**
 * Parses a page number. Returns null for anything that is not a positive
 * integer, so callers can tell "absent or invalid" apart from a real page.
 */
export const parsePageParam = (raw: RawParam): number | null => {
  const value = firstValue(raw)
  if (!value || !/^[0-9]+$/.test(value)) return null

  const parsed = Number.parseInt(value, 10)
  return Number.isSafeInteger(parsed) && parsed >= 1 ? parsed : null
}

/**
 * Reads the listing state from a page's `searchParams`. Lenient by design:
 * the proxy already redirects invalid values to the canonical URL, so
 * anything that still slips through falls back to the defaults instead of
 * failing the render.
 */
export const parseBlogListingParams = (
  searchParams: Record<string, RawParam> | null | undefined,
): BlogListingState => {
  const sort = firstValue(searchParams?.[BLOG_SORT_PARAM])

  return {
    page: parsePageParam(searchParams?.[BLOG_PAGE_PARAM]) ?? 1,
    sort: isBlogSort(sort) ? sort : DEFAULT_BLOG_SORT,
  }
}

/**
 * Builds the canonical href for a listing state. Default values are left out,
 * so page 1 in the default order is always the bare base path.
 */
export const buildBlogListingHref = (
  basePath: string,
  { page = 1, sort = DEFAULT_BLOG_SORT }: Partial<BlogListingState> = {},
): string => {
  const params = new URLSearchParams()
  if (sort !== DEFAULT_BLOG_SORT) params.set(BLOG_SORT_PARAM, sort)
  if (page > 1) params.set(BLOG_PAGE_PARAM, String(page))

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

/**
 * Matches every URL shape a listing can arrive under: /blog, /blog/<topic>
 * and the legacy /blog/page/<n> and /blog/<topic>/page/<n> segments that
 * pagination used before it moved to search params.
 */
const LISTING_PATH = /^\/blog(?:\/([^/]+))?(?:\/page\/([^/]+))?\/?$/

export interface BlogListingUrlResolution {
  /** Canonical path + query to redirect to, or null if already canonical. */
  redirect: string | null
  /**
   * False for alternative sort orders: they list the same posts as the
   * default order, so only the default should be indexed.
   */
  indexable: boolean
}

/**
 * Canonicalises a listing URL for the proxy:
 *
 * - legacy `/page/<n>` segments move into `?page=<n>`
 * - `page` values that are invalid or 1, and `sort` values that are unknown
 *   or the default, are dropped, and repeated values collapse to the first
 * - every other query param (utm tags and the like) is kept in place
 *
 * Returns null for paths that are not a listing (posts, the feed, reserved
 * segments and invalid legacy page segments), which the router then handles
 * — or 404s — on its own.
 */
export const resolveBlogListingUrl = (
  pathname: string,
  search: string,
): BlogListingUrlResolution | null => {
  const match = LISTING_PATH.exec(pathname)
  if (!match) return null

  const [, topic, legacyPage] = match

  // `/blog/post/...`, `/blog/feed.xml` and other route-owned segments — topic
  // slugs are slugified and never contain a dot
  if (topic && (RESERVED_TOPIC_SLUGS.includes(topic) || topic.includes('.'))) return null

  let pageFromPath: number | null = null
  if (legacyPage !== undefined) {
    pageFromPath = parsePageParam(legacyPage)
    if (pageFromPath === null) return null
  }

  const basePath = topic ? `${BLOG_PATH}/${topic}` : BLOG_PATH
  const incoming = new URLSearchParams(search)
  const params = new URLSearchParams()
  let seenPage = false
  let seenSort = false
  let sort: BlogSort = DEFAULT_BLOG_SORT

  for (const [key, value] of incoming) {
    if (key === BLOG_PAGE_PARAM) {
      if (seenPage) continue
      seenPage = true
      // a page in the legacy path segment wins over one in the query
      const page = pageFromPath ?? parsePageParam(value)
      if (page !== null && page > 1) params.append(key, String(page))
      continue
    }

    if (key === BLOG_SORT_PARAM) {
      if (seenSort) continue
      seenSort = true
      if (isBlogSort(value) && value !== DEFAULT_BLOG_SORT) {
        sort = value
        params.append(key, value)
      }
      continue
    }

    params.append(key, value)
  }

  if (!seenPage && pageFromPath !== null && pageFromPath > 1) {
    params.append(BLOG_PAGE_PARAM, String(pageFromPath))
  }

  const query = params.toString()
  const canonical = query ? `${basePath}?${query}` : basePath
  // compared in serialised form: re-encoding untouched params (`%20` → `+`)
  // alone must not trigger a redirect
  const incomingQuery = incoming.toString()
  const current = incomingQuery ? `${pathname}?${incomingQuery}` : pathname

  return {
    redirect: canonical === current ? null : canonical,
    indexable: sort === DEFAULT_BLOG_SORT,
  }
}
