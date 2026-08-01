import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateMeta } from '@/lib/generateMeta'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionSlug } from '@/types/collections'

import { BlogListPage, queryPublishedTopicBySlug } from '../_shared/BlogListPage'

export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    pagination: false,
    limit: 0,
    draft: false,
    select: {
      slug: true,
    },
  })

  if (docs.length === 0) {
    // Cache Components requires at least one param for build-time validation;
    // '__placeholder__' resolves to notFound() against an empty database.
    return [
      {
        slug: '__placeholder__',
      },
    ]
  }

  return docs.map(({ slug }) => ({
    slug,
  }))
}

/**
 * Posts filtered by topic. Later pages live at /blog/<topic>/page/<n>.
 *
 * See the note in /blog/page.tsx on why `searchParams` is not read here.
 */
export default async function Page({ params }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  // `/blog/post/...` and `/blog/page/...` are handled by their own routes
  if (RESERVED_TOPIC_SLUGS.includes(slug)) notFound()

  const topic = await queryPublishedTopicBySlug(slug)
  if (!topic) notFound()

  return <BlogListPage topic={topic} page={1} />
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  if (RESERVED_TOPIC_SLUGS.includes(slug)) {
    return {
      title: 'Blog',
    }
  }

  const topic = await queryPublishedTopicBySlug(slug)
  return generateMeta({
    doc: topic,
  })
}
