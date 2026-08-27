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
  cacheTag('featuredTopics')

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
    depth: 2,
  })

  return topics.filter((topic) => topic.relatedPosts?.docs?.length > 0)
}

export const FeaturedTopics = async ({ currentSlug = '/' }: FeaturedTopicsProps) => {
  const topics = await fetchFeaturedTopics()

  const allTopics = [
    {
      slug: '/',
      title: 'All Topics',
      relatedPosts: {
        docs: [],
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
          {relatedPosts?.docs?.length > 0 && (
            <span className="ml-1">({relatedPosts?.docs?.length})</span>
          )}
        </Link>
      ))}
    </div>
  )
}
