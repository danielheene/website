import { Suspense } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { PageFallback } from '@/components/PageFallback'
import { fetchPublishedTopicBySlug } from '@/lib/fetchers/fetchPublishedTopicBySlug'
import { generateMeta } from '@/lib/generateMeta'
import { ogImageMetadata } from '@/lib/og/ogImageMetadata'
import { placeholderParams } from '@/lib/placeholderParams'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionSlug } from '@/types/collections'

import { BlogListPage } from '../_shared/BlogListPage'

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
 * The post listing: every post on /blog, which re-exports this route without
 * a slug, or one topic's posts on /blog/<topic>. Pagination and sorting live
 * in `?page=` and `?sort=`; that promise is handed to the listing unresolved
 * so it is only read inside a Suspense boundary.
 */
export default async function PageShell(props: PageProps<'/blog/[slug]'>) {
  return (
    <Suspense fallback={<PageFallback />}>
      <Page {...props} />
    </Suspense>
  )
}

async function Page({ params, searchParams }: PageProps<'/blog/[slug]'>) {
  const { slug } = await params

  if (!slug) return <BlogListPage searchParams={searchParams} />

  // `/blog/post/...` is handled by its own route, `/blog/page/...` by the proxy
  if (RESERVED_TOPIC_SLUGS.includes(slug)) notFound()

  const topic = await fetchPublishedTopicBySlug(slug)

  if (!topic) notFound()

  return <BlogListPage topic={topic} searchParams={searchParams} />
}

export async function generateMetadata({ params }: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await params

  if (!slug) {
    return {
      title: 'Blog',
      openGraph: {
        title: 'Blog',
        images: [
          ogImageMetadata(
            {
              listing: 'blog',
            },
            'Blog',
          ),
        ],
      },
    }
  }

  if (RESERVED_TOPIC_SLUGS.includes(slug)) {
    return {
      title: 'Blog',
    }
  }

  const topic = await fetchPublishedTopicBySlug(slug)

  return generateMeta({
    doc: topic,
    collection: CollectionSlug.BlogTopics,
  })
}
