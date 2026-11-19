'use client'

import { useRowLabel } from '@payloadcms/ui'

import { resolveSlideThumbnail, type SlideRowData } from './resolveSlideThumbnail'
import { ShaderThumbnail } from './ShaderThumbnail'

/**
 * Collapsed-row label for `HeroSlidesField`: a small thumbnail — the
 * uploaded image, a video's poster frame, or the shader's preview image — next
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
          <ShaderThumbnail presetKey={thumbnail.presetKey} />
        ) : thumbnail.kind === 'image-url' ? (
          // oxlint-disable-next-line nextjs/no-img-element -- a tiny admin-only preview thumbnail, not a page asset
          <img alt="" className="size-full object-cover" src={thumbnail.url} />
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
