'use server'

import { cacheLife, cacheTag } from 'next/cache'

const API_KEY_HEADER = 'Authorization'

const getAuthHeader = (): string => {
  const apiKey = process.env.PAYLOAD_API_KEY
  const usersSlug = 'users' // Payload's default users collection slug

  if (!apiKey) {
    throw new Error('PAYLOAD_API_KEY is not set')
  }

  return `${usersSlug} API-Key ${apiKey}`
}

const buildUrl = (path: string): URL => {
  const base = process.env.PAYLOAD_API_URL

  if (!base) {
    throw new Error('PAYLOAD_API_URL is not set')
  }

  const basePath = new URL(base).pathname

  const mergedPath = basePath.length && !path.startsWith(basePath) ? `${basePath}${path}` : path

  console.log(mergedPath)

  return new URL(mergedPath, base)
}

type FetchOptions = {
  depth?: number
  where?: Record<string, unknown>
  sort?: string
  limit?: number
  pagination?: boolean
  draft?: boolean
  select?: Record<string, boolean>
  /**
   * Join fields to count. A join's `totalDocs` is only included when the
   * request asks for it explicitly — `joins[relatedPosts][count]=true` —
   * so a join that is only read for its count has to be listed here.
   */
  joinsCount?: string[]
  [key: string]: unknown
}

const fetchPayload = async <T>(path: string, options: FetchOptions = {}): Promise<T> => {
  const url = buildUrl(path)
  const searchParams = new URLSearchParams()

  // Always send depth=0 explicitly (Payload's REST default is 2)
  searchParams.set('depth', String(options.depth ?? 0))

  if (options.where) {
    searchParams.set('where', JSON.stringify(options.where))
  }

  if (options.sort) {
    searchParams.set('sort', options.sort)
  }

  if (options.limit !== undefined) {
    searchParams.set('limit', String(options.limit))
  }

  if (options.pagination !== undefined) {
    searchParams.set('pagination', String(options.pagination))
  }

  if (options.draft !== undefined) {
    searchParams.set('draft', String(options.draft))
  }

  if (options.select) {
    searchParams.set('select', JSON.stringify(options.select))
  }

  // Payload parses the query string with `qs`, so a nested object has to use
  // bracket notation — a JSON string stays a string and is never unpacked.
  for (const join of options.joinsCount ?? []) {
    searchParams.set(`joins[${join}][count]`, 'true')
  }

  url.search = searchParams.toString()

  const response = await fetch(url.toString(), {
    headers: {
      [API_KEY_HEADER]: getAuthHeader(),
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`Payload API request failed: ${response.status} ${response.statusText}`)
  }

  return (await response.json()) as T
}

export type PaginatedResponse<T> = {
  docs: T[]
  totalDocs: number
  limit: number
  totalPages: number
  page: number
  pagingCounter: number
  hasPrevPage: boolean
  hasNextPage: boolean
  prevPage: number | null
  nextPage: number | null
}

/** Fetch a single document by ID from a collection. */
export const fetchDocumentByID = async <T>(
  collection: string,
  id: string,
  options: {
    cacheTag?: string
    cacheLife?:
      | 'max'
      | 'hours'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
  } = {},
): Promise<T | null> => {
  if (options.cacheTag) {
    ;('use cache')
    cacheLife((options.cacheLife ?? 'max') as Parameters<typeof cacheLife>[0])
    cacheTag(collection)
    cacheTag(`${collection}:${id}`)
  }

  const data = await fetchPayload<T>(`/api/${collection}/${id}`, {
    depth: 0,
  })

  // Payload returns a single document at the top level — unlike a list, it
  // is not wrapped in a `doc` property.
  return data ?? null
}

/** Fetch documents from a collection with optional filtering. */
export const fetchCollection = async <T>(
  collection: string,
  options: FetchOptions & {
    cacheTag?: string
    cacheLife?:
      | 'max'
      | 'hours'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
  } = {},
): Promise<T[]> => {
  if (options.cacheTag) {
    ;('use cache')
    cacheLife((options.cacheLife ?? 'max') as Parameters<typeof cacheLife>[0])
    cacheTag(collection)
  }

  const { where, sort, limit, pagination, draft, select, depth, joinsCount } = options

  const data = await fetchPayload<PaginatedResponse<T>>(`/api/${collection}`, {
    depth: depth ?? 0,
    where,
    sort,
    limit,
    pagination,
    draft,
    select,
    joinsCount,
  })

  return data.docs
}

/** Fetch a global by slug. */
export const fetchGlobal = async <T>(
  slug: string,
  options: {
    cacheTag?: string
    cacheLife?:
      | 'max'
      | 'hours'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
  } = {},
): Promise<T | null> => {
  if (options.cacheTag) {
    ;('use cache')
    cacheLife((options.cacheLife ?? 'max') as Parameters<typeof cacheLife>[0])
    cacheTag(slug)
  }

  const data = await fetchPayload<T>(`/api/globals/${slug}`, {
    depth: 0,
  })

  // Payload returns a global's document at the top level — unlike a
  // collection, it is not wrapped in a `doc` property.
  return data ?? null
}

/** Fetch a paginated collection response (docs + totals). */
export const fetchCollectionPaginated = async <T>(
  collection: string,
  options: FetchOptions & {
    cacheTag?: string
    cacheLife?:
      | 'max'
      | 'hours'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
      | 'minutes'
      | 'days'
      | 'weeks'
      | 'months'
  } = {},
): Promise<PaginatedResponse<T>> => {
  if (options.cacheTag) {
    ;('use cache')
    cacheLife((options.cacheLife ?? 'max') as Parameters<typeof cacheLife>[0])
    cacheTag(collection)
  }

  const { where, sort, limit, pagination, draft, select, depth } = options

  return fetchPayload<PaginatedResponse<T>>(`/api/${collection}`, {
    depth: depth ?? 0,
    where,
    sort,
    limit,
    pagination,
    draft,
    select,
  })
}

export const countCollection = async (
  collection: string,
  where?: Record<string, unknown>,
): Promise<number> => {
  const searchParams = new URLSearchParams()
  searchParams.set('depth', '0')

  if (where) {
    searchParams.set('where', JSON.stringify(where))
  }

  const data = await fetchPayload<{ totalDocs: number }>(
    `/api/${collection}/count?${searchParams.toString()}`,
    { depth: 0 },
  )

  return data.totalDocs
}
