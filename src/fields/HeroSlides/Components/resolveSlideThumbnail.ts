import { SHADER_PRESET_MAP, type ShaderPresetKey } from '@/components/HeroMedia/shaderPresets'

type PopulatedMediaValue = {
  url?: string
  // Matches `MediaVideo['thumbnails']`'s real shape: a polymorphic upload
  // relation, populated or not.
  thumbnails?:
    | {
        value?:
          | string
          | {
              url?: string
            }
      }[]
    | null
}

/**
 * Just enough of a picked doc for a slide preview to render — never the
 * full doc. Keyed by media id, populated by `useHeroSlideFieldEditor`
 * whenever a slide is inserted/replaced; see `resolveSlideThumbnail`'s doc
 * comment for why this exists instead of reading straight off form state.
 */
export type MediaThumbnailCache = Record<string, PopulatedMediaValue>

/**
 * One row of `HeroSlidesField`'s array, as it appears in admin form state.
 * `media.value` is a bare id on any row this session added/replaced (see
 * `useHeroSlideFieldEditor`'s doc comment for why it can't stay a populated
 * object), but may still be the fully populated relation Payload sends down
 * on the document's initial load, before any edit — both are handled here.
 */
export type SlideRowData = {
  slideType?: 'image' | 'video' | 'shader'
  media?: {
    relationTo?: string
    value?: string | PopulatedMediaValue
  }
  shader?: ShaderPresetKey
}

export type ResolvedSlideThumbnail =
  | {
      kind: 'shader'
      presetKey: ShaderPresetKey
      label: string
    }
  | {
      kind: 'image-url'
      url: string
    }
  | {
      kind: 'empty'
    }

/**
 * Resolves what a slide row's thumbnail should actually show: the shader
 * preset key (for a live `ShaderPreviewCanvas`), an image URL (the uploaded
 * image itself, or a video's poster frame), or nothing yet (a fresh/pending
 * row with no media set). Shared by `RowLabel`, `SlideThumb`, and
 * `HeroSlidesSidebarEditor` so every preview resolves the same way.
 *
 * `thumbnailCache` (the `id → {url}`/`{thumbnails}` map from
 * `useHeroSlideFieldEditor`) is consulted whenever `media.value` is a bare
 * id — which is any row this session added/replaced, once Payload's own
 * form-state sync has run. Rows populated straight from the document's
 * initial load instead carry the object directly and never need the cache.
 */
export const resolveSlideThumbnail = (
  data: SlideRowData | undefined,
  thumbnailCache?: MediaThumbnailCache,
): ResolvedSlideThumbnail => {
  const slideType = data?.slideType ?? 'image'

  if (slideType === 'shader' && data?.shader) {
    const preset = SHADER_PRESET_MAP[data.shader]
    if (preset) {
      return {
        kind: 'shader',
        presetKey: preset.key,
        label: preset.label,
      }
    }
  }

  const rawValue = data?.media?.value
  const populated: PopulatedMediaValue | undefined =
    typeof rawValue === 'object'
      ? rawValue
      : typeof rawValue === 'string'
        ? thumbnailCache?.[rawValue]
        : undefined

  const imageUrl = slideType !== 'shader' ? populated?.url : undefined

  const posterThumbnail =
    slideType === 'video'
      ? populated?.thumbnails?.find((thumbnail) => typeof thumbnail?.value === 'object')?.value
      : undefined
  const posterUrl = typeof posterThumbnail === 'object' ? posterThumbnail?.url : undefined

  const url = imageUrl ?? posterUrl

  if (url) {
    return {
      kind: 'image-url',
      url,
    }
  }

  return {
    kind: 'empty',
  }
}
