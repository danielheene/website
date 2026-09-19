'use client'

import dynamic from 'next/dynamic'
import { useRowLabel } from '@payloadcms/ui'

import { resolveSlideThumbnail, type SlideRowData } from './resolveSlideThumbnail'
import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

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
  const thumbnail = resolveSlideThumbnail(data)

  return (
    <div className="flex items-center gap-3">
      <div className="h-10 w-16 shrink-0 overflow-hidden rounded-sm border border-input bg-black/5">
        {thumbnail.kind === 'shader' ? (
          <ShaderPreviewCanvas
            className="h-full w-full"
            entry={SHADER_COMPONENTS[thumbnail.presetKey]}
          />
        ) : thumbnail.kind === 'image-url' ? (
          // biome-ignore lint/performance/noImgElement: a tiny admin-only preview thumbnail, not a page asset
          <img alt="" className="h-full w-full object-cover" src={thumbnail.url} />
        ) : null}
      </div>
      <span className="text-sm">
        Slide {number}
        {thumbnail.kind === 'shader' ? ` — ${thumbnail.label}` : ''}
        {slideType === 'video' ? ' — Video' : ''}
      </span>
    </div>
  )
}

export default RowLabel
