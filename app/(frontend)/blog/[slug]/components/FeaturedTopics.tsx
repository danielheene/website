import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { cn } from 'tailwind-variants'

import { generateContentPath } from '@/lib/generateContentPath'
import { CollectionSlug } from '@/types/collections'

interface FeaturedTopicsProps {
  currentSlug?: string
}

export const FeaturedTopics = async ({ currentSlug = '/' }: FeaturedTopicsProps) => {
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
    },
    sort: '_order',
    depth: 0,
  })

  const allTopics = [
    {
      slug: '/',
      title: 'All Topics',
    },
    ...topics,
  ]

  return (
    <div className="flex flex-col gap-1">
      {allTopics.map(({ slug, title }) => (
        <Link
          href={generateContentPath(CollectionSlug.BlogTopics, slug)}
          key={slug}
          className={cn([
            'text-lg font-mono font-medium',
            slug === currentSlug ? 'opacity-100' : 'opacity-50',
          ])}
        >
          {title}
        </Link>
      ))}
    </div>
  )
}
