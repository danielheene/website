import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'

import { generateMeta } from '@/lib/generateMeta'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'

import {
  BlogListPage,
  countTotalPages,
  queryPublishedTopicBySlug,
  resolvePageParam,
} from '../../../_shared/BlogListPage'

/** See the note in /blog/page/[page] — Cache Components needs a seed param. */
export async function generateStaticParams() {
  return [
    {
      slug: '__placeholder__',
      page: '2',
    },
  ]
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
