'use server'

let token: string | null = null

const login = async () => {
  const response = await fetch(`${process.env.UMAMI_HOST_URL}/api/auth/login`, {
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
  const response = await fetch(`${process.env.UMAMI_HOST_URL}/api/auth/verify`, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  return response.ok
}

const getToken = async () => {
  const verified = await verify()

  if (!verified) {
    await login()
  }

  return token
}

const fetcher = async <T>(url: URL | string): Promise<T | null> => {
  const token = await getToken()
  console.log(token)
  console.log(url)
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
  })

  return await response.json()
}

const buildApiUrl = (path: string, params?: Pick<AllApiParams, 'startAt' | 'endAt'> & Partial<Omit<AllApiParams, 'startAt' | 'endAt'>>) => {
  const searchParams = params
    ? new URLSearchParams({
        ...params,
        startAt: params.startAt.getTime().toString(),
        endAt: params.endAt.getTime().toString(),
      }).toString()
    : ''

  return new URL(`/api/websites/${process.env.UMAMI_SITE_ID}/${path}?${searchParams}`, process.env.UMAMI_HOST_URL)
}

type Metric = { x: string; y: number }

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
  pageViews: number
  visitors: number
  visits: number
  bounce: number
  totalTime: number
  comparison: {
    pageViews: number
    visitors: number
    visits: number
    bounce: number
    totalTime: number
  }
}
export type UmamiEventsParams = Pick<AllApiParams, 'startAt' | 'endAt'>
export type UmamiEvents = Metric[]
export type UmamiPathsParams = Pick<AllApiParams, 'startAt' | 'endAt'>
export type UmamiPaths = Metric[]
export type UmamiPageViewsParams = Pick<AllApiParams, 'startAt' | 'endAt' | 'timezone' | 'unit'>
export type UmamiPageViews = {
  pageviews: Metric[]
  sessions: Metric[]
}

export const fetchWebsite = async () => {
  const url = buildApiUrl('')
  return await fetcher<UmamiWebsite>(url)
}

export const fetchStats = async ({ startAt, endAt, unit }: UmamiStatsParams): Promise<UmamiStats | null> => {
  const url = buildApiUrl('stats', { startAt, endAt, unit })
  return await fetcher<UmamiStats>(url)
}

export const fetchEvents = async ({ startAt, endAt }: UmamiEventsParams): Promise<UmamiEvents | null> => {
  const url = buildApiUrl('metrics', { startAt, endAt, type: 'event' })
  return await fetcher<UmamiEvents>(url)
}

export const fetchPaths = async ({ startAt, endAt }: UmamiPathsParams): Promise<UmamiPaths | null> => {
  const url = buildApiUrl('metrics', { startAt, endAt, type: 'path' })
  return await fetcher<UmamiPaths>(url)
}

export const fetchPageViews = async ({ startAt, endAt, timezone, unit }: UmamiPageViewsParams): Promise<UmamiPageViews | null> => {
  const url = buildApiUrl('pageviews', { startAt, endAt, timezone, unit })
  return await fetcher<UmamiPageViews>(url)
}
