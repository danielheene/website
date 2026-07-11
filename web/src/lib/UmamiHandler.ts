'use server'

import { hoursToSeconds } from 'date-fns'
import Redis from 'ioredis'

let token: string | null = null
let redis: Redis | null = null

let verifyPromise: Promise<boolean> | null = null
const tokenPromise: Promise<string | null> | null = null

const login = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/login`, {
    method: 'POST',
    body: JSON.stringify({
      username: process.env.UMAMI_USERNAME,
      password: process.env.UMAMI_PASSWORD,
    }),
  })

  const data = await response.json()
  token = data.token as string
}

const verify = async () => {
  if (verifyPromise) return verifyPromise

  verifyPromise = new Promise((resolve) => {
    if (!token) {
      return resolve(false)
    }

    return fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => {
        resolve(response.ok)
      })
      .catch((error) => {
        console.error('Error verifying token:', error)
        resolve(false)
      })
  })

  return verifyPromise
}

const getToken = async () => {
  const verified = await verify()

  if (!verified) {
    await login()
  }

  return token
}

export const getRedis = async () => {
  if (!redis) {
    await new Promise((resolve) => {
      redis = new Redis(process.env.REDIS_URL, {
        connectionName: 'umami-handler',
        keyPrefix: 'umami',
        enableReadyCheck: true,
      }).once('ready', () => {
        resolve(true)
      })
    })
  }
  return redis
}

export const setCache = async <T extends object>(key: string, value: T) => {
  const redis = await getRedis()
  const stringifiedValue = JSON.stringify(value)
  return redis.set(key, stringifiedValue, 'EX', hoursToSeconds(2))
}

export const getCache = async <T extends object>(key: string): Promise<T | null> => {
  const redis = await getRedis()
  const data = await redis.get(key)
  return data ? JSON.parse(data) : null
}

const fetcher = async <T extends object>(url: URL | string): Promise<T | null> => {
  const data = await getCache(url.toString())
  if (data) return data as T

  const token = await getToken()
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  const json: T = await response.json()

  if ('error' in json) return null

  await setCache(url.toString(), json as T)
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
        startAt: params?.startAt?.getTime?.()?.toString(),
        endAt: params?.endAt?.getTime?.()?.toString(),
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
  startAt: Date
  endAt: Date
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
