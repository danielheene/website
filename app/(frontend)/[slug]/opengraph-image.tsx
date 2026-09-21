import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { resolveOgBackground } from '@/lib/resolveOgBackground'

import { queryPageBySlug } from './page'

export const alt = 'Page'
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{
    slug?: string
  }>
}

export default async function Image({ params }: Props) {
  const { slug = 'home' } = await params
  const page = await queryPageBySlug(slug)
  if (!page) notFound()

  const title = page.title ?? 'Page'

  const {
    general: { defaultOpengraphImage },
  } = await fetchSiteSettingsCached()

  // Only the first slide represents the OG image — a static export can't
  // depict a carousel. Falls back to the site-wide default OG image when the
  // page has no hero or its slide type can't be rendered as a static image.
  const bg = resolveOgBackground(page.hero?.slides, defaultOpengraphImage)

  const bgSrc = bg.kind === 'image' ? bg.url : bg.kind === 'shader' ? bg.thumbnailSrc : undefined

  return new ImageResponse(
    <div tw="relative flex h-full w-full flex-col items-start justify-end px-16 pb-20 text-neutral-100">
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
      <div
        tw="absolute inset-0 bg-black/40"
        style={{
          position: 'absolute',
          zIndex: -1,
        }}
      />
      <h1 tw="max-w-4xl text-6xl font-bold leading-[1.15] tracking-tight">{title}</h1>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
