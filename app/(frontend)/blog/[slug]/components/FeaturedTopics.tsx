import { cacheLife, cacheTag } from 'next/cache'
import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { cn } from 'tailwind-variants'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'

interface FeaturedTopicsProps {
  currentSlug?: string
}

const fetchFeaturedTopics = async () => {
  'use cache'
  cacheLife('max')
  cacheTag('featuredTopics', CollectionSlug.BlogPosts)

  const payload = await getPayload({
    config,
  })
  const { docs: topics } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    limit: 0,
    pagination: false,
    where: {
      featured: {
        equals: true,
      },
    },
    select: {
      slug: true,
      title: true,
      relatedPosts: true,
    },
    sort: '_order',
    depth: 0,
    // the query runs with overrideAccess, so the join would count drafts too;
    // only the total is shown, so no post docs are needed beyond it
    joins: {
      relatedPosts: {
        count: true,
        limit: 1,
        where: {
          _status: {
            equals: 'published',
          },
        },
      },
    },
  })

  return topics.filter((topic) => topic.relatedPosts?.totalDocs > 0)
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
            'text-lg font-mono font-medium',
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
