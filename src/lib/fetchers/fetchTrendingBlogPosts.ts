import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { hoursToSeconds, minutesToSeconds, subDays } from 'date-fns'

import { getToken } from '@/lib/umami/getToken'
import { CollectionSlug } from '@/types/collections'
import { BlogPostData } from '@/types/payload'

const BLOG_POST_PATH_PREFIX = '/blog/post/'

/**
 * Refetched every 45 minutes, intentionally shorter than the admin widget's 2h
 * TTL (UmamiWidget.data.ts) so "trending" reflects recent popularity shifts.
 * Long enough to stay in the prerendered shell.
 */
const TRENDING_CACHE_LIFE = {
  stale: minutesToSeconds(5),
  revalidate: minutesToSeconds(45),
  expire: hoursToSeconds(24),
}

export const TRENDING_BLOG_POSTS_TAG = 'trending-blog-posts'

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

const fetchMetrics = async (url: URL): Promise<Metric[] | null> => {
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

    // SAFETY: Umami's metrics endpoint returns `{ x, y }` rows; only the array shape is checked.
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
        // runs with overrideAccess, so never-published drafts must be excluded here
        _status: {
          equals: 'published',
        },
      },
    })

    const postsBySlug = new Map(docs.map((doc) => [doc.slug, doc]))

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

const loadTrendingBlogPosts = async (days: number, limit: number) => {
  const endAt = new Date()
  const startAt = subDays(endAt, days)

  const metrics = await fetchMetrics(buildApiUrl(startAt, endAt))

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

/**
 * The most viewed published posts of the last `days` days, or null when Umami
 * or the database can't be reached. Cached so rendering never waits on Umami;
 * a failed lookup is kept only for minutes, so the block comes back on its own.
 */
export const fetchTrendingBlogPosts = async ({
  days,
  limit,
}: {
  days: number
  limit: number
}): Promise<TrendingBlogPost[] | null> => {
  'use cache'
  cacheTag(CollectionSlug.BlogPosts, TRENDING_BLOG_POSTS_TAG)

  const posts = await loadTrendingBlogPosts(days, limit)

  if (posts) cacheLife(TRENDING_CACHE_LIFE)
  else cacheLife('minutes')

  return posts
}
