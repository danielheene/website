import { cn } from 'tailwind-variants'
import { ImageResponse } from 'takumi-js/response'

import { fetchGlobalUserSettingsCached, fetchSiteSettingsCached } from '@/lib/fetchers'

export const alt = 'Website'
export const size = {
  width: 1200,
  height: 630,
}

export default async function Image() {
  const {
    general: { description },
  } = await fetchSiteSettingsCached()
  const { name } = await fetchGlobalUserSettingsCached()

  return new ImageResponse(
    <div
      tw={cn(
        'relative flex h-full w-full flex-col items-start justify-end bg-neutral-900 px-16 pb-20 text-neutral-100',
      )}
    >
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
