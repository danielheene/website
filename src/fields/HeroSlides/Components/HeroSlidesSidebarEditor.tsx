'use client'

import { useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ArrayFieldClientProps } from 'payload'
import { useFormFields } from '@payloadcms/ui'

import { Icon } from '@/components/Icon'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'

import { AddSlideMenu } from './AddSlideMenu'
import { resolveSlideThumbnail, type SlideRowData } from './resolveSlideThumbnail'
import { SHADER_COMPONENTS } from './shaderComponents'
import { useHeroSlideFieldEditor } from './useHeroSlideFieldEditor'

const ShaderPreviewCanvas = dynamic(() => import('./ShaderPreviewCanvas'), {
  ssr: false,
})

/**
 * The sidebar editor for `HeroSlidesField` — a single large 16:9 preview of
 * one slide at a time (prev/next + dots to step through the rest), used
 * where hero is *only* background media selection (Posts/Topics). An actual
 * editor, not a read-only viewer: "+ Add Hero BG" and per-slide
 * Remove/Replace live right on it.
 *
 * (Where hero also carries other authoring fields alongside the background —
 * Pages' hero also has a content-type toggle and a RichText field — it gets
 * a full wide main-content tab instead, using `FilmstripEditor`'s
 * small-thumbnail-row layout. Both share their row-mutation core via
 * `useHeroSlideFieldEditor`.)
 */
export const HeroSlidesSidebarEditor = (props: ArrayFieldClientProps) => {
  const {
    path,
    rows,
    removeRow,
    importingId,
    pendingRowIndex,
    importUnsplashPhoto,
    uploadFile,
    insertImage,
    insertVideo,
    insertShader,
    replaceWithImage,
    replaceWithVideo,
    replaceWithShader,
    thumbnailCache,
  } = useHeroSlideFieldEditor(props)

  const [activeIndex, setActiveIndex] = useState(0)
  const clampedIndex = Math.min(activeIndex, Math.max(rows.length - 1, 0))
  const activeRow = rows[clampedIndex]
  const activeRowPath = activeRow ? `${path}.${clampedIndex}` : undefined
  const isActivePending = importingId !== null && clampedIndex === pendingRowIndex

  const data = useFormFields(([fields]) => {
    if (!activeRowPath) return undefined
    const slideType = fields?.[`${activeRowPath}.slideType`]?.value as SlideRowData['slideType']
    const media = fields?.[`${activeRowPath}.media`]?.value as SlideRowData['media']
    const shader = fields?.[`${activeRowPath}.shader`]?.value as SlideRowData['shader']

    return {
      slideType,
      media,
      shader,
    } satisfies SlideRowData
  })

  const thumbnail = useMemo(
    () => resolveSlideThumbnail(data, thumbnailCache),
    [
      data,
      thumbnailCache,
    ],
  )

  const canNavigate = rows.length > 1

  const goTo = (index: number) => {
    if (rows.length === 0) return
    setActiveIndex((index + rows.length) % rows.length)
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-md border border-input bg-black/5">
        {isActivePending ? (
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
          // biome-ignore lint/performance/noImgElement: a small admin-only sidebar preview, not a page asset
          <img alt="" className="h-full w-full object-cover" src={thumbnail.url} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            {rows.length === 0 ? 'No hero slides yet' : 'Empty'}
          </div>
        )}

        {canNavigate && !isActivePending && (
          <>
            <button
              aria-label="Previous slide"
              className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
              onClick={() => goTo(clampedIndex - 1)}
              type="button"
            >
              <Icon name="arrow-left" />
            </button>
            <button
              aria-label="Next slide"
              className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
              onClick={() => goTo(clampedIndex + 1)}
              type="button"
            >
              <Icon name="arrow-right" />
            </button>
          </>
        )}

        {rows.length > 0 && !isActivePending && (
          <div className="absolute right-1 bottom-1 flex items-center gap-1">
            <button
              aria-label="Remove slide"
              className="rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
              onClick={() => {
                removeRow({
                  rowIndex: clampedIndex,
                })
                setActiveIndex((index) => Math.max(0, Math.min(index, rows.length - 2)))
              }}
              type="button"
            >
              <Icon name="material-symbols:close" />
            </button>
            <AddSlideMenu
              importingId={importingId}
              menuId={`${path}-replace`}
              onSelectImage={(doc) => replaceWithImage(clampedIndex, doc)}
              onSelectShader={(key) => replaceWithShader(clampedIndex, key)}
              onSelectUnsplash={(result: UnsplashSearchResult) =>
                void importUnsplashPhoto(result.id, clampedIndex)
              }
              onSelectVideo={(doc) => replaceWithVideo(clampedIndex, doc)}
              onUploadImage={(file) => void uploadFile('image', file, clampedIndex)}
              onUploadVideo={(file) => void uploadFile('video', file, clampedIndex)}
              renderTrigger={
                <button
                  aria-label="Replace slide"
                  className="rounded-full bg-black/40 p-1 text-white hover:bg-black/60"
                  type="button"
                >
                  <Icon name="material-symbols:sync-alt" />
                </button>
              }
            />
          </div>
        )}
      </div>

      {canNavigate && (
        <div className="flex items-center justify-center gap-1.5">
          {rows.map((row, index) => (
            <button
              aria-current={index === clampedIndex}
              aria-label={`Go to slide ${index + 1}`}
              className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40 transition-colors aria-[current=true]:bg-muted-foreground"
              key={row.id}
              onClick={() => goTo(index)}
              type="button"
            />
          ))}
        </div>
      )}

      <AddSlideMenu
        disabled={importingId !== null}
        importingId={importingId}
        menuId={`${path}-add`}
        onSelectImage={(doc) => insertImage(rows.length, doc)}
        onSelectShader={(key) => insertShader(rows.length, key)}
        onSelectUnsplash={(result: UnsplashSearchResult) =>
          void importUnsplashPhoto(result.id, rows.length)
        }
        onSelectVideo={(doc) => insertVideo(rows.length, doc)}
        onUploadImage={(file) => void uploadFile('image', file, rows.length)}
        onUploadVideo={(file) => void uploadFile('video', file, rows.length)}
      />
    </div>
  )
}

export default HeroSlidesSidebarEditor
