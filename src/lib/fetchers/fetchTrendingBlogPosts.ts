'use server'

import config from '@payload-config'
import { getPayload } from 'payload'

import { minutesToSeconds, subDays } from 'date-fns'

import { get, set } from '@/lib/RedisHandler'
import { CollectionSlug } from '@/types/collections'
import { BlogPostData } from '@/types/payload'
import { getToken } from '@/widgets/UmamiWidget/UmamiWidget.data'

const BLOG_POST_PATH_PREFIX = '/blog/post/'
// Intentionally shorter than the admin widget's 2h TTL (UmamiWidget.data.ts)
// so "trending" reflects more recent popularity shifts.
const CACHE_TTL_SECONDS = minutesToSeconds(45)

type Metric = {
  x: string
  y: number
}

type RankedSlug = {
  slug: string
  views: number
}

export type TrendingBlogPost = RankedSlug & {
  post: BlogPostData
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

const resolveToBlogPosts = async (ranked: RankedSlug[]): Promise<TrendingBlogPost[] | null> => {
  if (ranked.length === 0) return []

  try {
    const payload = await getPayload({
      config,
    })

    const { docs } = await payload.find({
      collection: CollectionSlug.BlogPosts,
      draft: false,
      pagination: false,
      limit: ranked.length,
      where: {
        slug: {
          in: ranked.map(({ slug }) => slug),
        },
      },
    })

    const postsBySlug = new Map(
      docs.map((doc) => [
        doc.slug,
        doc,
      ]),
    )

    return ranked.flatMap(({ slug, views }) => {
      const post = postsBySlug.get(slug)
      return post
        ? [
            {
              slug,
              views,
              post,
            },
          ]
        : []
    })
  } catch (error) {
    console.error('Error resolving trending blog posts:', error)
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

  const ranked = metrics
    .filter((metric) => metric.x.startsWith(BLOG_POST_PATH_PREFIX))
    .map((metric) => ({
      slug: metric.x.slice(BLOG_POST_PATH_PREFIX.length),
      views: metric.y,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, limit)

  return resolveToBlogPosts(ranked)
}
