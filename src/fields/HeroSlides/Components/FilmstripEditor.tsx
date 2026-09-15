'use client'

import { useState } from 'react'
import type { ArrayFieldClientProps } from 'payload'

import useEmblaCarousel from 'embla-carousel-react'

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
 * belongs in the sidebar instead, using `HeroSlidesSidebarEditor`'s compact
 * single-preview-with-dots layout. Both share their row-mutation core via
 * `useHeroSlideFieldEditor`.)
 */
export const FilmstripEditor = (props: ArrayFieldClientProps) => {
  const {
    path,
    rows,
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

  // The row currently targeted by a "Replace" click — drives the hidden,
  // controlled `AddSlideMenu` instance shared by every `SlideThumb` (one
  // instance, retargeted per click, rather than one per row).
  const [replaceRowIndex, setReplaceRowIndex] = useState<number | null>(null)

  const canReorder = rows.length > 1

  const [emblaRef] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    dragFree: true,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex items-center gap-3">
          {rows.map((row, rowIndex) => (
            <SlideThumb
              canMoveLeft={rowIndex > 0}
              canMoveRight={rowIndex < rows.length - 1}
              canReorder={canReorder}
              isPending={importingId !== null && rowIndex === pendingRowIndex}
              key={row.id}
              onMoveLeft={() => moveRow(rowIndex, rowIndex - 1)}
              onMoveRight={() => moveRow(rowIndex, rowIndex + 1)}
              onRemove={() =>
                removeRow({
                  rowIndex,
                })
              }
              onReplace={() => setReplaceRowIndex(rowIndex)}
              rowPath={`${path}.${rowIndex}`}
              thumbnailCache={thumbnailCache}
            />
          ))}
        </div>
      </div>

      <div>
        <AddSlideMenu
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

      {/* One hidden, controlled `AddSlideMenu` shared by every `SlideThumb`'s
          "Replace" button — retargeted to the clicked row's index rather
          than instantiated per row, since only one can be open at a time. */}
      <AddSlideMenu
        importingId={importingId}
        menuId={`${path}-replace`}
        onOpenChange={(open) => {
          if (!open) setReplaceRowIndex(null)
        }}
        onSelectImage={(doc) => {
          if (replaceRowIndex !== null) replaceWithImage(replaceRowIndex, doc)
        }}
        onSelectShader={(key) => {
          if (replaceRowIndex !== null) replaceWithShader(replaceRowIndex, key)
        }}
        onSelectUnsplash={(result: UnsplashSearchResult) => {
          if (replaceRowIndex !== null) void importUnsplashPhoto(result.id, replaceRowIndex)
        }}
        onSelectVideo={(doc) => {
          if (replaceRowIndex !== null) replaceWithVideo(replaceRowIndex, doc)
        }}
        onUploadImage={(file) => {
          if (replaceRowIndex !== null) void uploadFile('image', file, replaceRowIndex)
        }}
        onUploadVideo={(file) => {
          if (replaceRowIndex !== null) void uploadFile('video', file, replaceRowIndex)
        }}
        open={replaceRowIndex !== null}
        renderTrigger={<span className="sr-only" />}
      />
    </div>
  )
}

export default FilmstripEditor
