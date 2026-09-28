import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateMeta } from '@/lib/generateMeta'
import { placeholderParams } from '@/lib/placeholderParams'
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
    return placeholderParams('/blog/[slug]')
  }

  return docs.map(({ slug }) => ({
    slug,
  }))
}

/**
 * Posts filtered by topic. Pagination and sorting live in `?page=` and
 * `?sort=` — see the note in /blog/page.tsx on how `searchParams` is read.
 */
export default async function Page({ params, searchParams }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  // `/blog/post/...` is handled by its own route, `/blog/page/...` by the proxy
  if (RESERVED_TOPIC_SLUGS.includes(slug)) notFound()

  const topic = await queryPublishedTopicBySlug(slug)
  if (!topic) notFound()

  return <BlogListPage topic={topic} searchParams={searchParams} />
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
