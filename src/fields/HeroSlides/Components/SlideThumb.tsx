'use client'

import dynamic from 'next/dynamic'
import { useFormFields } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { DuoTone } from '@/components/DuoTone'
import type { ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'
import { Icon } from '@/components/Icon'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'
import type { MediaImage, MediaVideo } from '@/types/payload'

import { AddSlideMenu } from './AddSlideMenu'
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
  /** A stable id for this row's own `AddSlideMenu` instance — see `AddSlideMenu`'s `menuId` doc comment. */
  menuId: string
  /**
   * Whether reorder carets make sense at all — hidden entirely for a
   * singleton array (nothing to reorder against), per the confirmed design:
   * a single slide shows only its preview, Remove, and Replace.
   */
  canReorder: boolean
  canMoveLeft: boolean
  canMoveRight: boolean
  isPending: boolean
  importingId: string | null
  onMoveLeft: () => void
  onMoveRight: () => void
  onRemove: () => void
  onReplaceWithImage: (doc: MediaImage) => void
  onReplaceWithVideo: (doc: MediaVideo) => void
  onReplaceWithShader: (key: ShaderPresetKey) => void
  onImportUnsplash: (result: UnsplashSearchResult) => void
  onUploadImage: (file: File) => void
  onUploadVideo: (file: File) => void
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
  menuId,
  canReorder,
  canMoveLeft,
  canMoveRight,
  isPending,
  importingId,
  onMoveLeft,
  onMoveRight,
  onRemove,
  onReplaceWithImage,
  onReplaceWithVideo,
  onReplaceWithShader,
  onImportUnsplash,
  onUploadImage,
  onUploadVideo,
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
        <DuoTone contained className="h-full w-full">
          <ShaderPreviewCanvas
            className="h-full w-full"
            entry={SHADER_COMPONENTS[thumbnail.presetKey]}
          />
        </DuoTone>
      ) : thumbnail.kind === 'image-url' ? (
        <DuoTone contained className="h-full w-full">
          {/* biome-ignore lint/performance/noImgElement: a tiny admin-only picker thumbnail, not a page asset */}
          <img alt="" className="h-full w-full object-cover" src={thumbnail.url} />
        </DuoTone>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          Empty
        </div>
      )}

      {/* Hover-only toolbar — never shown at rest, matching the sketch. */}
      {!isPending && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between bg-black/0 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:bg-black/40 group-hover:opacity-100">
          {canReorder ? (
            <Button
              aria-label="Move slide earlier"
              disabled={!canMoveLeft}
              onClick={onMoveLeft}
              size="icon-sm"
              type="button"
              variant="secondary"
            >
              <Icon name="arrow-left" />
            </Button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-1">
            <Button
              aria-label="Remove slide"
              onClick={onRemove}
              size="icon-sm"
              type="button"
              variant="secondary"
            >
              <Icon name="material-symbols:close" />
            </Button>
            <AddSlideMenu
              importingId={importingId}
              menuId={menuId}
              onSelectImage={onReplaceWithImage}
              onSelectShader={onReplaceWithShader}
              onSelectUnsplash={onImportUnsplash}
              onSelectVideo={onReplaceWithVideo}
              onUploadImage={onUploadImage}
              onUploadVideo={onUploadVideo}
              renderTrigger={
                <Button aria-label="Replace slide" size="icon-sm" type="button" variant="secondary">
                  <Icon name="material-symbols:sync-alt" />
                </Button>
              }
            />
          </div>

          {canReorder ? (
            <Button
              aria-label="Move slide later"
              disabled={!canMoveRight}
              onClick={onMoveRight}
              size="icon-sm"
              type="button"
              variant="secondary"
            >
              <Icon name="arrow-right" />
            </Button>
          ) : (
            <span />
          )}
        </div>
      )}
    </div>
  )
}

export default SlideThumb
