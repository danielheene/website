import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import config from '@payload-config'
import { getPayload } from 'payload'

import { generateMeta } from '@/lib/generateMeta'
import { PLACEHOLDER_SLUG, placeholderParams } from '@/lib/placeholderParams'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionSlug } from '@/types/collections'

import {
  BlogListPage,
  countTotalPages,
  queryPublishedTopicBySlug,
  resolvePageParam,
} from '../../../_shared/BlogListPage'

/**
 * Seeds page 2 of every topic that actually has one. Cache Components needs at
 * least one param to validate against, and seeding a real topic — rather than a
 * synthetic slug that only ever resolves to notFound() — means the prerendered
 * shells correspond to reachable URLs. Topics with a single page contribute
 * nothing here; deeper pages are generated on demand.
 */
export async function generateStaticParams() {
  const payload = await getPayload({
    config,
  })

  const { docs = [] } = await payload.find({
    collection: CollectionSlug.BlogTopics,
    draft: false,
    limit: 1000,
    overrideAccess: false,
    pagination: false,
    select: {
      slug: true,
    },
  })

  const topics = docs.filter(({ slug }) => slug && !RESERVED_TOPIC_SLUGS.includes(slug))

  const params = (
    await Promise.all(
      topics.map(async ({ id, slug }) => {
        const totalPages = await countTotalPages(id)
        return Array.from(
          {
            length: Math.max(totalPages - 1, 0),
          },
          (_, index) => ({
            slug,
            page: String(index + 2),
          }),
        )
      }),
    )
  ).flat()

  // Cache Components still requires a non-empty list when no topic paginates.
  // Unlike the other routes this is reachable in a healthy build — a site whose
  // topics all fit on one page is legitimate — so it warns only when the topic
  // query itself came back empty.
  if (params.length === 0) {
    if (topics.length === 0) {
      return placeholderParams('/blog/[slug]/page/[page]', {
        page: '2',
      })
    }

    return [
      {
        slug: PLACEHOLDER_SLUG,
        page: '2',
      },
    ]
  }

  return params
}

/** Paginated topic listing: /blog/<topic>/page/2 and beyond. */
export default async function Page({ params }: PageProps<'/blog/[slug]/page/[page]'>) {
  const { slug, page: rawPage } = await params

  if (RESERVED_TOPIC_SLUGS.includes(slug)) notFound()

  const page = resolvePageParam(rawPage)
  if (page === null) notFound()

  const topic = await queryPublishedTopicBySlug(slug)
  if (!topic) notFound()

  // page 1 has a canonical URL of its own; never serve it twice
  if (page === 1) redirect(`/blog/${topic.slug}`)

  if (page > (await countTotalPages(topic.id))) notFound()

  return <BlogListPage topic={topic} page={page} />
}

export async function generateMetadata({
  params,
}: PageProps<'/blog/[slug]/page/[page]'>): Promise<Metadata> {
  const { slug, page } = await params

  if (RESERVED_TOPIC_SLUGS.includes(slug)) {
    return {
      title: 'Blog',
    }
  }

  const topic = await queryPublishedTopicBySlug(slug)
  const meta = await generateMeta({
    doc: topic,
  })

  return {
    ...meta,
    title: `${meta.title ?? topic?.title ?? 'Blog'} — page ${page}`,
  }
}
