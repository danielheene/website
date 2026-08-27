import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'

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

  const background = post.hero?.background
  const title = post.title ?? 'Blog post'

  const shaderThumbnailSrc =
    background?.backgroundType === 'shader' && background.shader
      ? SHADER_PRESET_MAP[background.shader as keyof typeof SHADER_PRESET_MAP]?.thumbnail.src
      : undefined

  // BlogPosts' `hero.background.media` is a `hasMany: false` polymorphic
  // upload field: it resolves as a single `{ relationTo, value }` wrapper
  // object (never an array), where `value` holds the populated media
  // document (with `.url`) once resolved by `queryPostBySlug`. Mirrors the
  // `isPopulated` discriminator in `HeroMedia.tsx`, minus the array step.
  const heroImageUrl =
    background?.backgroundType === 'media' &&
    background.media &&
    typeof background.media === 'object' &&
    'relationTo' in background.media &&
    background.media.relationTo === 'images' &&
    typeof background.media.value === 'object'
      ? (background.media.value?.url ?? undefined)
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
