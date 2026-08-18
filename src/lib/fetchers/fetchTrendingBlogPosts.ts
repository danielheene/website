'use server'

import { subDays } from 'date-fns'

import { get, set } from '@/lib/RedisHandler'
import { getToken } from '@/widgets/UmamiWidget/UmamiWidget.data'

const BLOG_POST_PATH_PREFIX = '/blog/post/'
const CACHE_TTL_SECONDS = 60 * 60 * 2

type Metric = {
  x: string
  y: number
}

export type TrendingBlogPost = {
  slug: string
  views: number
}

const buildApiUrl = (startAt: Date, endAt: Date) => {
  const searchParams = new URLSearchParams({
    type: 'url',
    startAt: startAt.getTime().toString(),
    endAt: endAt.getTime().toString(),
  }).toString()

  return new URL(
    `/api/websites/${process.env.NEXT_PUBLIC_UMAMI_SITE_ID}/metrics?${searchParams}`,
    process.env.NEXT_PUBLIC_UMAMI_URL,
  )
}

const fetcher = async (url: URL | string): Promise<Metric[] | null> => {
  const cached = await get<Metric[]>(url.toString())
  if (cached) return cached

  try {
    const token = await getToken()
    if (!token) return null

    const response = await fetch(url, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    const json = await response.json()
    if (!Array.isArray(json)) return null

    await set(url.toString(), json as Metric[], CACHE_TTL_SECONDS)
    return json as Metric[]
  } catch (error) {
    console.error('Error fetching trending blog posts:', error)
    return null
  }
}

export const fetchTrendingBlogPosts = async ({
  days,
  limit,
}: {
  days: number
  limit: number
}): Promise<TrendingBlogPost[] | null> => {
  const endAt = new Date()
  const startAt = subDays(endAt, days)

  const url = buildApiUrl(startAt, endAt)
  const metrics = await fetcher(url)

  if (!metrics) return null

  return metrics
    .filter((metric) => metric.x.startsWith(BLOG_POST_PATH_PREFIX))
    .map((metric) => ({
      slug: metric.x.slice(BLOG_POST_PATH_PREFIX.length),
      views: metric.y,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)
}
