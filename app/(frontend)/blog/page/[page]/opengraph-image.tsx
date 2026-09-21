import { ImageResponse } from 'takumi-js/response'

import { fetchSiteSettingsCached } from '@/lib/fetchers'
import { resolveOgBackground } from '@/lib/resolveOgBackground'

export const alt = 'Blog'
export const size = {
  width: 1200,
  height: 630,
}

type Props = {
  params: Promise<{
    page: string
  }>
}

export default async function Image({ params }: Props) {
  const { page } = await params

  const {
    general: { defaultOpengraphImage },
  } = await fetchSiteSettingsCached()

  const bg = resolveOgBackground(defaultOpengraphImage)
  const bgSrc = bg.kind === 'image' ? bg.url : bg.kind === 'shader' ? bg.thumbnailSrc : undefined

  return new ImageResponse(
    <div
      tw={`relative flex h-full w-full flex-col items-center justify-center text-neutral-100${!bgSrc ? ' bg-neutral-900' : ''}`}
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
      <h1 tw="text-7xl font-bold tracking-tight">Blog</h1>
      <p tw="mt-4 text-2xl text-neutral-400">Page {page}</p>
    </div>,
    {
      width: 1200,
      height: 630,
    },
  )
}
