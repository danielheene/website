'use client'

import { usePayloadAPI } from '@payloadcms/ui'

import { buildMediaScopeWhere, MediaScope } from '@/fields/GeneratorFlags/baseFilter'
import { CollectionSlug } from '@/types/collections'
import type { MediaImage, MediaVideo } from '@/types/payload'

import { MediaPickerDrawer } from './MediaPickerDrawer'

interface FindResponse<T> {
  docs: T[]
}

const resolveImageThumbnail = (doc: MediaImage): string | undefined =>
  doc.sizes?.thumbnail?.url || doc.thumbnailURL || doc.url || undefined

const resolveVideoPoster = (doc: MediaVideo): string | undefined => {
  const populated = (doc.thumbnails ?? []).find(
    (thumbnail) => typeof thumbnail?.value === 'object' && thumbnail.value !== null,
  )?.value

  if (!populated || typeof populated !== 'object') return undefined

  return populated.sizes?.thumbnail?.url || populated.url || undefined
}

interface SelectMediaDrawerProps {
  slug: string
  kind: 'image' | 'video'
  value?: string
  onSelectAction: (doc: MediaImage | MediaVideo) => void
}

/**
 * "Select" source for `AddSlideMenu`: browse the existing `MediaImages` or
 * `MediaVideos` library as a thumbnail grid, through the shared
 * `MediaPickerDrawer` shell — Payload's default relationship picker (a
 * table/list view) doesn't match that shell's look, so this replaces it for
 * the hero-slide picking flow specifically. Fetches the 50 most recent
 * assets; there is no search/pagination footer yet (see the sibling
 * Unsplash/image-library drawers for a paginated example if that becomes
 * necessary here too).
 *
 * Scoped to `MediaScope.Uploaded` — the same "hand-uploaded, not machine-
 * generated" filter the collections' own list views default to (see
 * `scopeMediaAssets`) — applied explicitly here via `where`, since that
 * filter is Payload's `admin.baseFilter` and only runs for the List View and
 * Lexical internal-link relationship fields, not for this drawer's own
 * `usePayloadAPI` fetch. Without it, generated thumbnails/resume assets that
 * never appear in the real media list would still show up here.
 */
export const SelectMediaDrawer = ({
  slug,
  kind,
  value,
  onSelectAction,
}: SelectMediaDrawerProps) => {
  const collection = kind === 'image' ? CollectionSlug.MediaImages : CollectionSlug.MediaVideos

  const [{ data, isLoading, isError }] = usePayloadAPI(`/api/${collection}`, {
    initialParams: {
      limit: 50,
      sort: '-createdAt',
      depth: kind === 'video' ? 1 : 0,
      where: buildMediaScopeWhere(MediaScope.Uploaded),
    },
  })

  const docs = ((data as FindResponse<MediaImage | MediaVideo> | undefined)?.docs ?? []) as (
    | MediaImage
    | MediaVideo
  )[]

  return (
    <MediaPickerDrawer
      emptyMessage={
        isError
          ? 'Could not load the media library.'
          : `No ${kind === 'image' ? 'images' : 'videos'} yet — upload one instead.`
      }
      isLoading={isLoading}
      items={docs.map((doc) => {
        const thumbnailSrc =
          kind === 'image'
            ? resolveImageThumbnail(doc as MediaImage)
            : resolveVideoPoster(doc as MediaVideo)

        return {
          id: doc.id,
          label: doc.filename || doc.id,
          onSelect: () => onSelectAction(doc),
          selected: value === doc.id,
          thumbnail: thumbnailSrc ? (
            // biome-ignore lint/performance/noImgElement: a tiny admin-only picker thumbnail, not a page asset
            <img alt="" className="h-full w-full object-cover" src={thumbnailSrc} />
          ) : null,
        }
      })}
      slug={slug}
      title={kind === 'image' ? 'Select an image' : 'Select a video'}
    />
  )
}

export default SelectMediaDrawer
