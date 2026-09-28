import { cacheLife, cacheTag } from 'next/cache'
import config from '@payload-config'
import { getPayload } from 'payload'

import { BLOG_FEED_PATH, BLOG_FEED_SIZE } from '@/lib/blog/feed'
import { BLOG_PATH, BLOG_SORT_OPTIONS } from '@/lib/blog/listing'
import { postContentToHtml } from '@/lib/blog/postContentToHtml'
import { buildRssFeed, type RssItem } from '@/lib/blog/rss'
import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { generateContentURL } from '@/lib/generateContentURL'
import { latestTimestamp } from '@/lib/latestTimestamp'
import { CollectionSlug } from '@/types/collections'
import type { BlogPostData, Topic } from '@/types/payload'

/**
 * Builds the whole document once and caches it under the posts tag, which
 * `revalidateBlogPost` invalidates on every post change. Under Cache
 * Components the handler itself then prerenders like any static route.
 */
const buildBlogFeed = async (): Promise<string> => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.BlogPosts)

  const [payload, { general }, { name: author }] = await Promise.all([
    getPayload({
      config,
    }),
    fetchSiteSettingsCached(),
    fetchGlobalUserSettingsCached(),
  ])

  const { docs } = await payload.find({
    collection: CollectionSlug.BlogPosts,
    draft: false,
    overrideAccess: false,
    limit: BLOG_FEED_SIZE,
    sort: [
      ...BLOG_SORT_OPTIONS.newest.sort,
    ],
    // populates topics, uploads and internal links inside the content
    depth: 2,
    where: {
      _status: {
        equals: 'published',
      },
    },
  })

  const posts = docs as BlogPostData[]

  const items: RssItem[] = posts.map((post) => ({
    title: post.title,
    link: generateContentURL({
      collection: CollectionSlug.BlogPosts,
      slug: post.slug,
    }),
    pubDate: post.createdAt,
    description: post.meta?.description ?? undefined,
    contentHtml: postContentToHtml(post.content as Parameters<typeof postContentToHtml>[0]),
    categories: (post.topics ?? [])
      .map(({ value }) => (typeof value === 'object' ? (value as Topic).title : null))
      .filter(Boolean),
    creator: author ?? undefined,
  }))

  // newest content change rather than "now", so an unchanged feed stays
  // byte-identical between rebuilds
  const lastBuildDate = latestTimestamp(...posts.map(({ updatedAt }) => updatedAt))

  return buildRssFeed(
    {
      title: general?.siteName ? `${general.siteName} — Blog` : 'Blog',
      link: generateContentURL({
        path: BLOG_PATH,
      }),
      description: general?.description || 'Latest posts from the blog.',
      selfUrl: generateContentURL({
        path: BLOG_FEED_PATH,
      }),
      language: 'en',
      lastBuildDate,
      ttl: 60,
    },
    items,
  )
}

export async function GET() {
  return new Response(await buildBlogFeed(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}
