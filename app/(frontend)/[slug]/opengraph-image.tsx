import { notFound } from 'next/navigation'

import { ImageResponse } from 'takumi-js/response'

import { SHADER_PRESET_MAP } from '@/components/HeroMedia/shaderPresets'

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

  const background = page.hero?.background
  const title = page.title ?? 'Page'

  const shaderThumbnailSrc =
    background?.backgroundType === 'shader' && background.shader
      ? SHADER_PRESET_MAP[background.shader as keyof typeof SHADER_PRESET_MAP]?.thumbnail.src
      : undefined

  // Pages' `hero.background.media` is a `hasMany: true` polymorphic upload
  // field: it always resolves as an array of `{ relationTo, value }` wrapper
  // objects, never a bare media object. `value` only holds the populated
  // media document (with `.url`) once the relation has been resolved by the
  // query this route reuses (`queryPageBySlug`, shared with `[slug]/page.tsx`).
  // Mirrors the `isPopulated`/`toItems` pattern in `HeroMedia.tsx`.
  const firstImageEntry = Array.isArray(background?.media)
    ? background.media.find(
        (entry) =>
          typeof entry === 'object' &&
          entry !== null &&
          entry.relationTo === 'images' &&
          typeof entry.value === 'object' &&
          entry.value !== null,
      )
    : undefined

  const heroImageUrl =
    background?.backgroundType === 'media' &&
    firstImageEntry &&
    typeof firstImageEntry.value === 'object'
      ? (firstImageEntry.value?.url ?? undefined)
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
