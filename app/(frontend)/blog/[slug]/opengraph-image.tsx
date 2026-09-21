import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { resolveOgBackground } from '@/lib/resolveOgBackground'
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

  const {
    general: { defaultOpengraphImage },
  } = await fetchSiteSettingsCached()

  const bg = resolveOgBackground(topic.hero?.slides, defaultOpengraphImage)
  const bgSrc = bg.kind === 'image' ? bg.url : bg.kind === 'shader' ? bg.thumbnailSrc : undefined

  return new ImageResponse(
    <div
      tw={`relative flex h-full w-full flex-col items-start justify-center px-16 text-neutral-100${!bgSrc ? ' bg-neutral-900' : ''}`}
    >
      {bgSrc && (
        // biome-ignore lint/performance/noImgElement: Takumi/OG image rendering requires a plain <img>, not next/image
        <img
          alt=""
          src={bgSrc}
          tw="absolute inset-0 h-full w-full object-cover"
          style={{
            position: 'absolute',
            zIndex: -1,
          }}
        />
      )}
      {bgSrc && (
        <div
          tw="absolute inset-0 bg-black/40"
          style={{
            position: 'absolute',
            zIndex: -1,
          }}
        />
      )}
      <p tw="text-2xl font-medium text-neutral-400">Blog</p>
      <h1 tw="mt-4 max-w-4xl text-6xl font-bold leading-[1.15] tracking-tight">{topic.title}</h1>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
