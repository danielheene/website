'use client'

import { useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { ArrayFieldClientProps } from 'payload'
import { useFormFields } from '@payloadcms/ui'

import { Button } from '@/components/Button'
import { DuoTone } from '@/components/DuoTone'
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
 * The sidebar editor for `HeroSlidesField` — a single large 16:9 preview,
 * used where hero is *only* background media selection (Posts/Topics). The
 * field is always `maxRows: 1` for this variant (see `editorVariant` in
 * `../index.ts`), so there is never a second slide to navigate to — this
 * component carries no prev/next/dots, unlike `FilmstripEditor`'s carousel.
 * An actual editor, not a read-only viewer: "+ Add Hero BG" and Remove/
 * Replace for the one slide live right on it.
 *
 * (Where hero also carries other authoring fields alongside the background —
 * Pages' hero also has a content-type toggle and a RichText field — it gets
 * a full wide main-content tab instead, using `FilmstripEditor`'s carousel,
 * unbounded at one or more slides. Both share their row-mutation core via
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

  const hasRow = rows.length > 0
  const rowPath = hasRow ? `${path}.0` : undefined
  const isPending = importingId !== null && pendingRowIndex === 0

  const data = useFormFields(([fields]) => {
    if (!rowPath) return undefined
    const slideType = fields?.[`${rowPath}.slideType`]?.value as SlideRowData['slideType']
    const media = fields?.[`${rowPath}.media`]?.value as SlideRowData['media']
    const shader = fields?.[`${rowPath}.shader`]?.value as SlideRowData['shader']

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

  return (
    <div className="group relative aspect-video w-full overflow-hidden rounded-md border border-input bg-black/5">
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
          {/* biome-ignore lint/performance/noImgElement: a small admin-only sidebar preview, not a page asset */}
          <img alt="" className="h-full w-full object-cover" src={thumbnail.url} />
        </DuoTone>
      ) : !hasRow ? (
        <div className="flex h-full w-full items-center justify-center">
          <AddSlideMenu
            disabled={importingId !== null}
            importingId={importingId}
            menuId={`${path}-add`}
            onSelectImage={(doc) => insertImage(0, doc)}
            onSelectShader={(key) => insertShader(0, key)}
            onSelectUnsplash={(result: UnsplashSearchResult) =>
              void importUnsplashPhoto(result.id, 0)
            }
            onSelectVideo={(doc) => insertVideo(0, doc)}
            onUploadImage={(file) => void uploadFile('image', file, 0)}
            onUploadVideo={(file) => void uploadFile('video', file, 0)}
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
      ) : (
        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
          Empty
        </div>
      )}

      {/* Hover-only toolbar — never shown at rest, matching `SlideThumb`'s convention. */}
      {hasRow && !isPending && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-end gap-1 bg-black/0 p-1 opacity-0 transition-opacity group-hover:pointer-events-auto group-hover:bg-black/40 group-hover:opacity-100">
          <Button
            aria-label="Remove slide"
            onClick={() =>
              removeRow({
                rowIndex: 0,
              })
            }
            size="icon-sm"
            type="button"
            variant="secondary"
          >
            <Icon name="material-symbols:close" />
          </Button>
          <AddSlideMenu
            importingId={importingId}
            menuId={`${path}-replace`}
            onSelectImage={(doc) => replaceWithImage(0, doc)}
            onSelectShader={(key) => replaceWithShader(0, key)}
            onSelectUnsplash={(result: UnsplashSearchResult) =>
              void importUnsplashPhoto(result.id, 0)
            }
            onSelectVideo={(doc) => replaceWithVideo(0, doc)}
            onUploadImage={(file) => void uploadFile('image', file, 0)}
            onUploadVideo={(file) => void uploadFile('video', file, 0)}
            renderTrigger={
              <Button aria-label="Replace slide" size="icon-sm" type="button" variant="secondary">
                <Icon name="material-symbols:sync-alt" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  )
}

export default HeroSlidesSidebarEditor
