import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'
import { toSlideItems } from '@/components/HeroMedia/toSlideItems'

import { queryPostBySlug } from './page'

export const alt = 'Blog post'
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
  const { slug } = await params
  const post = await queryPostBySlug({
    slug: slug ?? '',
  })
  if (!post) notFound()

  const title = post.title ?? 'Blog post'

  // Only the first slide represents the OG image — a static export can't
  // depict a carousel. Guarded like `HeroMedia`'s own rendering: a preset
  // renamed/removed since the slide was saved resolves to no thumbnail
  // rather than throwing and taking down the image route.
  const [firstSlide] = toSlideItems(post.hero?.slides, title)

  const heroImageUrl = firstSlide?.kind === 'image' ? firstSlide.url : undefined
  const shaderThumbnailSrc =
    firstSlide?.kind === 'shader'
      ? SHADER_PRESET_MAP[firstSlide.presetKey]?.thumbnail.src
      : undefined

  return new ImageResponse(
    <div tw="relative flex h-full w-full flex-col items-start justify-end px-16 pb-20 text-neutral-100">
      {heroImageUrl && (
        // biome-ignore lint/performance/noImgElement: Takumi/OG image rendering requires a plain <img>, not next/image
        <img
          alt=""
          src={heroImageUrl}
          tw="absolute inset-0 h-full w-full object-cover"
          style={{
            position: 'absolute',
            zIndex: -1,
          }}
        />
      )}
      {shaderThumbnailSrc && (
        // biome-ignore lint/performance/noImgElement: Takumi/OG image rendering requires a plain <img>, not next/image
        <img
          alt=""
          src={shaderThumbnailSrc}
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
