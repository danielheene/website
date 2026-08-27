import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { RESERVED_TOPIC_SLUGS } from '@/types/blog'

import { queryPublishedTopicBySlug } from '../_shared/BlogListPage'

export const alt = 'Blog topic'
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{
    slug: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug } = await params
  if (RESERVED_TOPIC_SLUGS.includes(slug)) notFound()

  const topic = await queryPublishedTopicBySlug(slug)
  if (!topic) notFound()

  return new ImageResponse(
    <div tw="flex h-full w-full flex-col items-start justify-center bg-neutral-900 px-16 text-neutral-100">
      <p tw="text-2xl font-medium text-neutral-400">Blog</p>
      <h1 tw="mt-4 max-w-4xl text-6xl font-bold leading-[1.15] tracking-tight">{topic.title}</h1>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
