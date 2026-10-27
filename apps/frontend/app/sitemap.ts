import type { MetadataRoute } from 'next'
import { cacheLife, cacheTag } from 'next/cache'

import { BLOG_PATH } from '@website/lib/blog/listing'
import { generateContentURL } from '@website/lib/generateContentURL'
import { latestTimestamp as latest } from '@website/lib/latestTimestamp'
import { RESERVED_TOPIC_SLUGS } from '@website/types/blog'
import { CollectionSlug } from '@website/types/collections'

import { fetchCollection } from '@/lib/payloadClient'

/**
 *    Sitemap
 *
 *    Lists every public, canonical URL the frontend renders:
 *
 *      /                    home (the Pages doc with slug `home`)
 *      /<slug>              published Pages
 *      /blog                the post listing
 *      /blog/<topic>        topics that have at least one published post
 *      /blog/post/<slug>    published posts
 *
 *    Left out on purpose: `?page=` / `?sort=` listing variants (same content
 * as the canonical listing, and discovered through its links), the RSS
 * feed, and resume documents (only readable by signed-in users).
 *
 *    A listing's lastModified is its newest post's, since that is when its
 *    rendered content last changed.
 */

type Dated = {
  updatedAt?: Date | string | null
}

const querySitemapData = async () => {
  'use cache'
  cacheLife('max')
  cacheTag(CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogTopics)

  const published = {
    _status: {
      equals: 'published',
    },
  } as const

  const [pages, posts, topics] = await Promise.all([
    fetchCollection<{
      slug?: string
      updatedAt?: Date | string | null
    }>(CollectionSlug.Pages, {
      where: published,
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
    fetchCollection<{
      slug?: string
      updatedAt?: Date | string | null
      topics?: { value?: { id?: string } | string | null }[]
    }>(CollectionSlug.BlogPosts, {
      where: published,
      select: {
        slug: true,
        updatedAt: true,
        topics: true,
      },
    }),
    fetchCollection<{
      slug?: string
      updatedAt?: Date | string | null
      id?: string
    }>(CollectionSlug.BlogTopics, {
      select: {
        slug: true,
        updatedAt: true,
      },
    }),
  ])

  return {
    pages: pages ?? [],
    posts: posts ?? [],
    topics: topics ?? [],
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { pages, posts, topics } = await querySitemapData()

  const entry = (url: string, { updatedAt }: Dated): MetadataRoute.Sitemap[number] => {
    const lastModified = latest(updatedAt)

    return {
      url,
      ...(lastModified
        ? {
            lastModified,
          }
        : {}),
    }
  }

  // newest post update per topic id; unpopulated relations carry the bare id
  const topicUpdatedAt = new Map<string, string>()

  for (const post of posts) {
    for (const { value } of post.topics ?? []) {
      const id = typeof value === 'object' ? value?.id : value

      if (!id) continue
      topicUpdatedAt.set(id, latest(topicUpdatedAt.get(id), post.updatedAt))
    }
  }

  const pageEntries = pages
    // a Page slugged `blog` is shadowed by the static /blog route, and listing
    // it would duplicate the blog entry below
    .filter(({ slug }) => Boolean(slug) && slug !== BLOG_PATH.slice(1))
    // home first — it resolves to `/`
    .sort((a, b) => Number(b.slug === 'home') - Number(a.slug === 'home'))
    .map((page) =>
      entry(
        generateContentURL({
          collection: CollectionSlug.Pages,
          slug: page.slug,
        }),
        page,
      ),
    )

  const blogEntries =
    posts.length > 0
      ? [
          entry(
            generateContentURL({
              path: BLOG_PATH,
            }),
            {
              updatedAt: latest(...posts.map(({ updatedAt }) => updatedAt)),
            },
          ),
        ]
      : []

  // an empty topic renders "No posts published yet" — not worth indexing
  const topicEntries = topics
    .filter(
      ({ id, slug }) => slug && !RESERVED_TOPIC_SLUGS.includes(slug) && topicUpdatedAt.has(id),
    )
    .map((topic) =>
      entry(
        generateContentURL({
          collection: CollectionSlug.BlogTopics,
          slug: topic.slug,
        }),
        {
          updatedAt: latest(topic.updatedAt, topicUpdatedAt.get(topic.id)),
        },
      ),
    )

  const postEntries = posts
    .filter(({ slug }) => Boolean(slug))
    .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime())
    .map((post) =>
      entry(
        generateContentURL({
          collection: CollectionSlug.BlogPosts,
          slug: post.slug,
        }),
        post,
      ),
    )

  return [...pageEntries, ...blogEntries, ...topicEntries, ...postEntries]
}
