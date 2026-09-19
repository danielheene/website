import { CollectionSlug } from '@/types/collections'
import type { MediaImage, MediaVideo } from '@/types/payload'

import type { HeroMediaItem } from './HeroSlide'
import type { ShaderPresetKey } from './shaderPresets'

/**
 * A populated polymorphic upload entry.
 *
 * Note this is `relationTo`, not the `referenceTo` shape that
 * `@/lib/typeGuards` describes — that one belongs to the references plugin.
 * Payload's own upload fields emit `relationTo`, and `value` is only an object
 * once the relation has been populated.
 */
type UploadEntry<Slug extends string, Value> = {
  relationTo: Slug
  value: string | Value
}

const isPopulated = <Slug extends string, Value>(
  entry: unknown,
  slug: Slug,
): entry is UploadEntry<Slug, Value> & {
  value: Value
} =>
  typeof entry === 'object' &&
  entry !== null &&
  'relationTo' in entry &&
  entry.relationTo === slug &&
  'value' in entry &&
  typeof entry.value === 'object' &&
  entry.value !== null

/** One row of `HeroSlidesField`'s array, as read back from Payload. */
type SlideRow = {
  id?: string
  slideType?: 'image' | 'video' | 'shader'
  media?: unknown
  shader?: string
}

const isSlideRow = (row: unknown): row is SlideRow => typeof row === 'object' && row !== null

/**
 * Normalizes `HeroSlidesField`'s array value — each row an image, a video, or
 * a shader preset — into a flat list of renderable slides.
 *
 * Anything unpopulated (a bare id), of an unexpected collection, or naming an
 * unrecognized shader preset (one renamed/removed since the row was saved) is
 * dropped rather than rendered as a broken slide.
 */
export const toSlideItems = (slides: unknown, fallbackAlt: string): HeroMediaItem[] => {
  const rows = Array.isArray(slides) ? slides : []

  return rows.flatMap((row, index): HeroMediaItem[] => {
    if (!isSlideRow(row)) return []

    // Falls back to the row's own id (or its index) only when there is no
    // asset id to key off — a shader slide, or a row missing one entirely.
    const rowId = row.id ? String(row.id) : String(index)

    if (row.slideType === 'shader') {
      if (!row.shader) return []

      return [
        {
          kind: 'shader',
          id: rowId,
          presetKey: row.shader as ShaderPresetKey,
        },
      ]
    }

    const { media } = row

    if (isPopulated<'images', MediaImage>(media, CollectionSlug.MediaImages)) {
      const { id, url, alt, blurDataURL } = media.value
      if (!url) return []

      return [
        {
          kind: 'image',
          id: id ? String(id) : rowId,
          url,
          alt: alt || fallbackAlt,
          blurDataURL,
        },
      ]
    }

    if (isPopulated<'videos', MediaVideo>(media, CollectionSlug.MediaVideos)) {
      const { id, url, thumbnails } = media.value
      if (!url) return []

      // Videos have no alt of their own; the generated thumbnail doubles as a
      // poster so the slide is not blank before the first frame decodes.
      const poster = (thumbnails ?? []).find(
        (thumbnail) => typeof thumbnail?.value === 'object' && thumbnail.value?.url,
      )?.value

      return [
        {
          kind: 'video',
          id: id ? String(id) : rowId,
          url,
          alt: fallbackAlt,
          poster: typeof poster === 'object' ? poster.url : undefined,
        },
      ]
    }

    return []
  })
}
