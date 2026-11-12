'use server'

import { hoursToSeconds } from 'date-fns'

import { requireSession } from '@/lib/actions/requireSession'
import { get, set } from '@/lib/RedisHandler'
import { getToken } from '@/lib/umami/getToken'

const CACHE_TTL_SECONDS = hoursToSeconds(2)

const fetcher = async <T extends object>(url: URL | string): Promise<T | null> => {
  const cached = await get<T>(url.toString())

  if (cached) return cached

  // An unreachable Umami must not take the admin dashboard down with it:
  // every widget handles `null`.
  const token = await getToken()

  if (!token) return null

  try {
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
  } catch {
    return null
  }
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

/**
 * Every export of this module is a server action, a callable endpoint whichever
 * page renders the widget, so each one checks the session itself.
 */
export const fetchWebsite = async () => {
  await requireSession()

  const url = buildApiUrl('')

  return await fetcher<UmamiWebsite>(url)
}

export const fetchStats = async ({
  startAt,
  endAt,
  unit,
}: UmamiStatsParams): Promise<UmamiStats | null> => {
  await requireSession()

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
  await requireSession()

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
  await requireSession()

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
  await requireSession()

  const url = buildApiUrl('pageviews', {
    startAt,
    endAt,
    timezone,
    unit,
  })

  return await fetcher<UmamiPageViews>(url)
}
