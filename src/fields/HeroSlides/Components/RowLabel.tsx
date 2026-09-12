'use client'

import dynamic from 'next/dynamic'
import { useRowLabel } from '@payloadcms/ui'

import { SHADER_PRESET_MAP, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

type SlideRowData = {
  slideType?: 'image' | 'video' | 'shader'
  media?: {
    relationTo?: string
    value?: {
      url?: string
      thumbnails?: {
        value?: {
          url?: string
        }
      }[]
    }
  }
  shader?: ShaderPresetKey
}

/**
 * Collapsed-row label for `HeroSlidesField`: a small live thumbnail — the
 * uploaded image, a video's poster frame, or the shader rendering live — next
 * to a text label, instead of Payload's default "Slide 01".
 *
 * `useRowLabel` hands back this row's own sibling data directly, so it needs
 * no `useField` plumbing — unlike `ShaderSlideField`'s per-row select control.
 */
export const RowLabel = () => {
  const { data, rowNumber } = useRowLabel<SlideRowData>()

  const slideType = data?.slideType ?? 'image'
  const number = (rowNumber ?? 0) + 1

  const imageUrl =
    slideType !== 'shader' && typeof data?.media?.value === 'object'
      ? data.media.value?.url
      : undefined

  const posterUrl =
    slideType === 'video'
      ? data?.media?.value?.thumbnails?.find((thumbnail) => thumbnail?.value?.url)?.value?.url
      : undefined

  const shaderPreset =
    slideType === 'shader' && data?.shader ? SHADER_PRESET_MAP[data.shader] : undefined

  const thumbnailSrc = imageUrl ?? posterUrl

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-sm border border-input bg-black/5">
        {shaderPreset ? (
          <ShaderPreviewCanvas
            className="h-full w-full"
            entry={SHADER_COMPONENTS[shaderPreset.key]}
          />
        ) : thumbnailSrc ? (
          // biome-ignore lint/performance/noImgElement: a tiny admin-only preview thumbnail, not a page asset
          <img alt="" className="h-full w-full object-cover" src={thumbnailSrc} />
        ) : null}
      </div>
      <span className="text-sm">
        Slide {number}
        {slideType === 'shader' && shaderPreset ? ` — ${shaderPreset.label}` : ''}
        {slideType === 'video' ? ' — Video' : ''}
      </span>
    </div>
  )
}

export default RowLabel
