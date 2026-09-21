import type { ArrayField } from 'payload'

import { SHADER_PRESET_META } from '@/components/HeroMedia/shaderPresetMeta'
import { CollectionSlug } from '@/types/collections'

type HeroSlidesFieldOptions = {
  name: string
  /**
   * Caps the array length. Omit for an unbounded carousel (Pages); ignored
   * for `editorVariant: 'single'`, which is always capped at 1 regardless
   * of what's passed here — see `editorVariant`.
   */
  maxRows?: number
  /**
   * Which admin editor renders this array's rows:
   * - `'filmstrip'` (default) — an Embla carousel of 450px thumbnails,
   *   supports one or more slides.
   * - `'single'` — a single large 16:9 preview with no prev/next controls.
   *   Always exactly one slide (forces `maxRows: 1`).
   */
  editorVariant?: 'filmstrip' | 'single'
  /**
   * When `'sidebar'`, places the field in the document sidebar column via
   * `admin.position: 'sidebar'`. Independent of `editorVariant` — you can
   * use the sidebar editor layout without placing the field in the sidebar,
   * and vice versa.
   */
  position?: 'sidebar'
}

const EDITOR_COMPONENT_PATH: Record<
  NonNullable<HeroSlidesFieldOptions['editorVariant']>,
  string
> = {
  filmstrip: '@/fields/HeroSlides/Components/FilmstripEditor',
  single: '@/fields/HeroSlides/Components/SingleSlideEditor',
}

/**
 * One hero slide: an image, a video, or a curated WebGL shader preset,
 * selected per-row via `slideType`.
 *
 * Row admin UX is `FilmstripEditor` or `SingleSlideEditor` (see
 * `editorVariant`) — both replace Payload's default expand/collapse row list
 * entirely with a "+ Add Hero BG" menu and per-slide remove/replace.
 * `RowLabel` (the row list's collapsed label) is unused by either but kept
 * as a fallback.
 *
 * This field-config module must never import client components directly
 * (only their path strings, via `admin.components.*`) — `payload
 * generate:types` runs under plain Node, and a transitive `@payloadcms/ui`
 * import fails there on bundler-only `.css` imports. See
 * `src/fields/Icon/index.ts` for the identical established pattern.
 */
export const HeroSlidesField = ({
  name,
  maxRows,
  editorVariant = 'filmstrip',
  position,
}: HeroSlidesFieldOptions): ArrayField => {
  const resolvedPosition = position ?? (editorVariant === 'single' ? 'sidebar' : undefined)
  return {
    name,
    type: 'array',
    label: false,
    labels: {
      singular: 'Slide',
      plural: 'Slides',
    },
    minRows: 1,
    maxRows: editorVariant === 'single' ? 1 : maxRows,
    admin: {
      initCollapsed: true,
      ...(resolvedPosition
        ? {
            position: resolvedPosition,
          }
        : {}),
      components: {
        RowLabel: {
          path: '@/fields/HeroSlides/Components/RowLabel',
        },
        Field: {
          path: EDITOR_COMPONENT_PATH[editorVariant],
        },
      },
    },
    fields: [
      {
        name: 'slideType',
        type: 'select',
        defaultValue: 'image',
        options: [
          {
            label: 'Image',
            value: 'image',
          },
          {
            label: 'Video',
            value: 'video',
          },
          {
            label: 'Shader',
            value: 'shader',
          },
        ],
        admin: {
          disableListColumn: true,
          disableListFilter: true,
          disableGroupBy: true,
        },
      },
      {
        name: 'media',
        type: 'upload',
        relationTo: [
          CollectionSlug.MediaImages,
          CollectionSlug.MediaVideos,
        ],
        filterOptions: ({ siblingData }) => {
          const slideType = (
            siblingData as
              | {
                  slideType?: string
                }
              | undefined
          )?.slideType

          if (slideType === 'video') {
            return {
              mimeType: {
                contains: 'video',
              },
            }
          }

          return {
            mimeType: {
              contains: 'image',
            },
          }
        },
        displayPreview: true,
        label: false,
        admin: {
          condition: (_, siblingData) => siblingData?.slideType !== 'shader',
          description: 'Fills the first screen.',
          disableListColumn: true,
          disableListFilter: true,
          disableGroupBy: true,
        },
      },
      {
        name: 'shader',
        type: 'select',
        options: SHADER_PRESET_META.map((preset) => ({
          label: preset.label,
          value: preset.key,
        })),
        admin: {
          condition: (_, siblingData) => siblingData?.slideType === 'shader',
          disableListColumn: true,
          disableListFilter: true,
          disableGroupBy: true,
          components: {
            Field: {
              path: '@/fields/HeroSlides/Components/ShaderSlideField',
            },
          },
        },
      },
    ],
  }
}
