'use client'

import { useCallback, useEffect, useState } from 'react'
import type { ArrayFieldClientProps } from 'payload'

import useEmblaCarousel from 'embla-carousel-react'

import { Button } from '@/components/Button'
import { Icon } from '@/components/Icon'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'

import { AddSlideMenu } from './AddSlideMenu'
import { SlideThumb } from './SlideThumb'
import { useHeroSlideFieldEditor } from './useHeroSlideFieldEditor'

/**
 * The main-content-area editor for `HeroSlidesField`: an Embla carousel of
 * `SlideThumb`s, left-aligned, each slide fixed at 450px inline — chosen
 * over one large single-slide preview per row because the main form area is
 * wide, and over an unconstrained flex-wrap row because that let the strip
 * grow past the content width. Used where the Hero tab carries more than
 * just background media (e.g. Pages' hero also has a content-type toggle
 * and a RichText field), which is why it gets a full wide tab of its own
 * rather than living in the sidebar.
 *
 * (Where hero is *only* background media selection — Posts/Topics — it
 * belongs in the sidebar instead, using `SingleSlideEditor`'s compact
 * single-preview-with-dots layout. Both share their row-mutation core via
 * `useHeroSlideFieldEditor`.)
 */
export const FilmstripEditor = (props: ArrayFieldClientProps) => {
  const {
    path,
    rows,
    maxRows,
    removeRow,
    moveRow,
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

  const canReorder = rows.length > 1
  const canAddRow = maxRows === undefined || rows.length < maxRows

  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onEmblaSelect = useCallback(() => {
    if (!emblaApi) return
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [
    emblaApi,
  ])

  useEffect(() => {
    if (!emblaApi) return
    onEmblaSelect()
    emblaApi.on('select', onEmblaSelect)
    emblaApi.on('reInit', onEmblaSelect)
    return () => {
      emblaApi.off('select', onEmblaSelect)
      emblaApi.off('reInit', onEmblaSelect)
    }
  }, [
    emblaApi,
    onEmblaSelect,
  ])

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex items-center gap-3">
          {rows.map((row, rowIndex) => (
            <SlideThumb
              canMoveLeft={rowIndex > 0}
              canMoveRight={rowIndex < rows.length - 1}
              canReorder={canReorder}
              importingId={importingId}
              isPending={importingId !== null && rowIndex === pendingRowIndex}
              key={row.id}
              menuId={`${path}.${rowIndex}-replace`}
              onImportUnsplash={(result) => void importUnsplashPhoto(result.id, rowIndex)}
              onMoveLeft={() => moveRow(rowIndex, rowIndex - 1)}
              onMoveRight={() => moveRow(rowIndex, rowIndex + 1)}
              onRemove={() =>
                removeRow({
                  rowIndex,
                })
              }
              onReplaceWithImage={(doc) => replaceWithImage(rowIndex, doc)}
              onReplaceWithShader={(key) => replaceWithShader(rowIndex, key)}
              onReplaceWithVideo={(doc) => replaceWithVideo(rowIndex, doc)}
              onUploadImage={(file) => void uploadFile('image', file, rowIndex)}
              onUploadVideo={(file) => void uploadFile('video', file, rowIndex)}
              rowPath={`${path}.${rowIndex}`}
              thumbnailCache={thumbnailCache}
            />
          ))}

          {canAddRow && (
            <div className="flex aspect-video w-[450px] shrink-0 grow-0 basis-[450px] items-center justify-center overflow-hidden rounded-md border border-input bg-black/5">
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
                renderTrigger={
                  <Button
                    disabled={importingId !== null}
                    size="sm"
                    startIcon="plus"
                    type="button"
                    variant="secondary"
                  >
                    Select Hero BG
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          aria-label="Scroll slides left"
          disabled={!canScrollPrev}
          onClick={() => emblaApi?.scrollPrev()}
          size="icon-sm"
          type="button"
          variant="secondary"
        >
          <Icon name="arrow-left" />
        </Button>
        <Button
          aria-label="Scroll slides right"
          disabled={!canScrollNext}
          onClick={() => emblaApi?.scrollNext()}
          size="icon-sm"
          type="button"
          variant="secondary"
        >
          <Icon name="arrow-right" />
        </Button>
      </div>
    </div>
  )
}

export default FilmstripEditor
