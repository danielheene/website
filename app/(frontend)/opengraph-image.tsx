import { cn } from 'tailwind-variants'
import { ImageResponse } from 'takumi-js/response'

import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'
import { resolveOgBackground } from '@/lib/resolveOgBackground'

export const alt = 'Website'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  const {
    general: { description, defaultOpengraphImage },
  } = await fetchSiteSettingsCached()
  const { name } = await fetchGlobalUserSettingsCached()

  const bg = resolveOgBackground(defaultOpengraphImage)
  const bgSrc = bg.kind === 'image' ? bg.url : bg.kind === 'shader' ? bg.thumbnailSrc : undefined

  return new ImageResponse(
    <div
      tw={cn(
        'relative flex h-full w-full flex-col items-start justify-end px-16 pb-20 text-neutral-100',
        !bgSrc && 'bg-neutral-900',
      )}
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
      <h1 tw="text-6xl font-bold leading-[1.15] tracking-tight max-w-3xl">{name}</h1>
      {description && (
        <p tw="mt-6 max-w-2xl text-2xl leading-relaxed text-neutral-400">{description}</p>
      )}
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
