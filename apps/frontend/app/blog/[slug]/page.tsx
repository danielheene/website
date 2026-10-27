import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { placeholderParams } from '@website/lib/placeholderParams'
import { RESERVED_TOPIC_SLUGS } from '@website/types/blog'
import { CollectionSlug } from '@website/types/collections'

import { generateMeta } from '@/lib/generateMeta'
import { fetchCollection } from '@/lib/payloadClient'

import { BlogListPage, queryPublishedTopicBySlug } from '../_shared/BlogListPage'

export async function generateStaticParams() {
  const docs = await fetchCollection<{ slug?: string }>(CollectionSlug.BlogTopics, {
    select: {
      slug: true,
    },
  })

  if (!docs || docs.length === 0) {
    return placeholderParams('/blog/[slug]')
  }

  return docs.map(({ slug }) => ({
    slug: slug as string,
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
