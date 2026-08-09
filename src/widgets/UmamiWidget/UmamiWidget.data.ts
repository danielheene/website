'use server'

import { hoursToSeconds } from 'date-fns'

import { get, set } from '@/lib/RedisHandler'

let token: string | null = null
let tokenPromise: Promise<string | null> | null = null

const login = async (): Promise<string | null> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      username: process.env.UMAMI_USERNAME,
      password: process.env.UMAMI_PASSWORD,
    }),
  })

  const data = await response.json()
  token = data.token as string
  return token
}

const verify = async (): Promise<boolean> => {
  if (!token) return false

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error('Error verifying token:', error)
    return false
  }
}

/**
 * Returns a valid bearer token, verifying the current one first and logging
 * in again if it's missing/invalid. The in-flight promise is shared while
 * pending, so concurrent callers dedupe into a single verify/login flow, but
 * it's cleared once settled so the next call re-checks instead of being
 * stuck on the first result forever.
 */
export const getToken = async (): Promise<string | null> => {
  if (tokenPromise) return tokenPromise

  tokenPromise = (async () => {
    const verified = await verify()

    if (!verified) {
      await login()
    }

    return token
  })()

  try {
    return await tokenPromise
  } finally {
    tokenPromise = null
  }
}

const CACHE_TTL_SECONDS = hoursToSeconds(2)

const fetcher = async <T extends object>(url: URL | string): Promise<T | null> => {
  const cached = await get<T>(url.toString())
  if (cached) return cached

  const token = await getToken()

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const json: T = await response.json()
  if ('error' in json) return null

  await set(url.toString(), json as T, CACHE_TTL_SECONDS)
  return json
}

const buildApiUrl = (
  path: string,
  params?: Pick<AllApiParams, 'startAt' | 'endAt'> &
    Partial<Omit<AllApiParams, 'startAt' | 'endAt'>>,
) => {
  const searchParams = params
    ? new URLSearchParams({
        ...params,
        startAt: new Date(params.startAt).getTime().toString(),
        endAt: new Date(params.endAt).getTime().toString(),
      }).toString()
    : ''

  return new URL(
    `/api/websites/${process.env.NEXT_PUBLIC_UMAMI_SITE_ID}/${path}?${searchParams}`,
    process.env.NEXT_PUBLIC_UMAMI_URL,
  )
}

type Metric = {
  x: string
  y: number
}

type AllApiParams = {
  startAt: string
  endAt: string
  unit: string
  timezone: string
  type: string
}

export type UmamiWebsite = {
  id: string
  name: string
  domain: string
  shareId: string | null
  resetAt: string | null
  userId: string | null
  teamId: string | null
  createdBy: string | null
  createdAt: string | null
  updatedAt: string | null
  deletedAt: string | null
}
export type UmamiStatsParams = Pick<AllApiParams, 'startAt' | 'endAt' | 'unit'>
export type UmamiStats = {
  pageviews: number
  visitors: number
  visits: number
  bounces: number
  totaltime: number
  comparison: {
    pageviews: number
    visitors: number
    visits: number
    bounces: number
    totaltime: number
  }
}
export type UmamiEventsParams = Pick<AllApiParams, 'startAt' | 'endAt'>
export type UmamiEvent = Metric
export type UmamiPathsParams = Pick<AllApiParams, 'startAt' | 'endAt'>
export type UmamiPath = Metric
export type UmamiPageViewsParams = Pick<AllApiParams, 'startAt' | 'endAt' | 'timezone' | 'unit'>
export type UmamiPageViews = {
  pageviews: Metric[]
  sessions: Metric[]
}

export const fetchWebsite = async () => {
  const url = buildApiUrl('')
  return await fetcher<UmamiWebsite>(url)
}

export const fetchStats = async ({
  startAt,
  endAt,
  unit,
}: UmamiStatsParams): Promise<UmamiStats | null> => {
  const url = buildApiUrl('stats', {
    startAt,
    endAt,
    unit,
  })
  return await fetcher<UmamiStats>(url)
}

export const fetchEvents = async ({
  startAt,
  endAt,
}: UmamiEventsParams): Promise<UmamiEvent[] | null> => {
  const url = buildApiUrl('metrics', {
    startAt,
    endAt,
    type: 'event',
  })
  return await fetcher<UmamiEvent[]>(url)
}

export const fetchPaths = async ({
  startAt,
  endAt,
}: UmamiPathsParams): Promise<UmamiPath[] | null> => {
  const url = buildApiUrl('metrics', {
    startAt,
    endAt,
    type: 'path',
  })
  return await fetcher<UmamiPath[]>(url)
}

export const fetchPageViews = async ({
  startAt,
  endAt,
  timezone,
  unit,
}: UmamiPageViewsParams): Promise<UmamiPageViews | null> => {
  const url = buildApiUrl('pageviews', {
    startAt,
    endAt,
    timezone,
    unit,
  })
  return await fetcher<UmamiPageViews>(url)
}
