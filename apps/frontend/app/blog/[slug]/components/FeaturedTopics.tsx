import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'

import { generateContentPath } from '@website/lib/generateContentPath'
import { CollectionSlug } from '@website/types/collections'
import type { Topic } from '@website/types/payload'
import { cn } from 'tailwind-variants'

import { fetchCollection } from '@/lib/payloadClient'

interface FeaturedTopicsProps {
  currentSlug?: string
}

const fetchFeaturedTopics = async () => {
  'use cache'
  cacheLife('max')
  cacheTag('featuredTopics', CollectionSlug.BlogPosts)

  const topics = await fetchCollection<Topic>(CollectionSlug.BlogTopics, {
    pagination: false,
    depth: 0,
    // `relatedPosts.totalDocs` is only returned when the request asks the
    // join for its count; without it the filter below drops every topic.
    joinsCount: ['relatedPosts'],
    where: {
      featured: {
        equals: true,
      },
    },
    sort: '_order',
  })

  return topics.filter((topic) => (topic.relatedPosts?.totalDocs ?? 0) > 0)
}

export const FeaturedTopics = async ({ currentSlug = '/' }: FeaturedTopicsProps) => {
  const topics = await fetchFeaturedTopics()

  const allTopics = [
    {
      slug: '/',
      title: 'All Topics',
      relatedPosts: {
        totalDocs: 0,
      },
    },
    ...topics,
  ]

  return (
    <div className="flex flex-col gap-1">
      {allTopics.map(({ slug, title, relatedPosts }) => (
        <Link
          href={generateContentPath(CollectionSlug.BlogTopics, slug)}
          key={slug}
          className={cn([
            'font-mono text-lg font-medium',
            slug === currentSlug ? 'opacity-100' : 'opacity-50',
          ])}
        >
          {title}
          {relatedPosts?.totalDocs > 0 && <span className="ml-1">({relatedPosts.totalDocs})</span>}
        </Link>
      ))}
    </div>
  )
}
