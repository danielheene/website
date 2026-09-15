'use client'

import dynamic from 'next/dynamic'
import { useFormFields } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'

import {
  type MediaThumbnailCache,
  resolveSlideThumbnail,
  type SlideRowData,
} from './resolveSlideThumbnail'
import { SHADER_COMPONENTS } from './shaderComponents'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

export interface SlideThumbProps {
  /** This row's dotted path, e.g. `hero.slides.2`. */
  rowPath: string
  /**
   * Whether reorder carets make sense at all — hidden entirely for a
   * singleton array (nothing to reorder against), per the confirmed design:
   * a single slide shows only its preview, Remove, and Replace.
   */
  canReorder: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  isPending: boolean
  onMoveLeft: () => void
  onMoveRight: () => void
  onRemove: () => void
  onReplace: () => void
  /** See `resolveSlideThumbnail`'s doc comment — required to resolve a preview for any row added/replaced this session. */
  thumbnailCache: MediaThumbnailCache
}

/**
 * One filmstrip box: the slide's live thumbnail at rest, with a hover-only
 * toolbar (reorder-left, remove, replace, reorder-right) layered over it —
 * per the "WHEN MANY" sketch. The reorder carets are *not* carousel
 * navigation; they move this slide earlier/later in the array. A separate
 * slider-nav row (prev/next + dots, for viewing which slide is active
 * elsewhere in the editor) is unrelated to these.
 */
export const SlideThumb = ({
  rowPath,
  canReorder,
  canMoveLeft,
  canMoveRight,
  isPending,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onReplace,
  thumbnailCache,
}: SlideThumbProps) => {
  const data = useFormFields(([fields]) => {
    const slideType = fields?.[`${rowPath}.slideType`]?.value as SlideRowData['slideType']
    const media = fields?.[`${rowPath}.media`]?.value as SlideRowData['media']
    const shader = fields?.[`${rowPath}.shader`]?.value as SlideRowData['shader']

    return {
      slideType,
      media,
      shader,
    } satisfies SlideRowData
  })

  const thumbnail = resolveSlideThumbnail(data, thumbnailCache)

  return (
    <div className="group relative aspect-video w-[450px] shrink-0 grow-0 basis-[450px] overflow-hidden rounded-md border border-input bg-black/5">
      {isPending ? (
        <div className="flex h-full w-full items-center justify-center">
          <Icon
            className="animate-spin text-xl text-muted-foreground"
            name="material-symbols:progress-activity"
          />
        </div>
      ) : thumbnail.kind === 'shader' ? (
        <ShaderPreviewCanvas
          className="h-full w-full"
          entry={SHADER_COMPONENTS[thumbnail.presetKey]}
        />
      ) : thumbnail.kind === 'image-url' ? (
        // biome-ignore lint/performance/noImgElement: a tiny admin-only picker thumbnail, not a page asset
        <img alt="" className="h-full w-full object-cover" src={thumbnail.url} />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          Empty
        </div>
      )}

      {/* Hover-only toolbar — never shown at rest, matching the sketch. */}
      {!isPending && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between bg-black/0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:bg-black/40 group-hover:opacity-100">
          {canReorder ? (
            <button
              aria-label="Move slide earlier"
              className="p-1 text-white disabled:opacity-30"
              disabled={!canMoveLeft}
              onClick={onMoveLeft}
              type="button"
            >
              <Icon name="arrow-left" />
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            <button
              aria-label="Remove slide"
              className="p-1 text-white"
              onClick={onRemove}
              type="button"
            >
              <Icon name="material-symbols:close" />
            </button>
            <button
              aria-label="Replace slide"
              className="p-1 text-white"
              onClick={onReplace}
              type="button"
            >
              <Icon name="material-symbols:sync-alt" />
            </button>
          </div>

          {canReorder ? (
            <button
              aria-label="Move slide later"
              className="p-1 text-white disabled:opacity-30"
              disabled={!canMoveRight}
              onClick={onMoveRight}
              type="button"
            >
              <Icon name="arrow-right" />
            </button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}

export default SlideThumb
