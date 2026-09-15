import type { ArrayField } from 'payload'

import { SHADER_PRESET_META } from '@/components/HeroMedia/shaderPresetMeta'
import { CollectionSlug } from '@/types/collections'

type HeroSlidesFieldOptions = {
  name: string
  /**
   * Caps the array length. Omit for an unbounded carousel (Pages, BlogPosts,
   * BlogTopics); pass `1` where a single slide is still the intended shape
   * (e.g. SiteSettings' error hero, if it should stay non-carousel).
   */
  maxRows?: number
  /**
   * Which admin editor renders this array's rows:
   * - `'filmstrip'` (default) — a row of small thumbnails in a wide
   *   main-content tab. Use where the Hero tab carries more than just
   *   background media (Pages' hero also has a content-type toggle and a
   *   RichText field), which is why it needs a tab of its own.
   * - `'sidebar'` — a single large 16:9 preview with prev/next + dots,
   *   compact enough for the document sidebar. Use where hero is *only*
   *   background media selection (Posts/Topics).
   */
  editorVariant?: 'filmstrip' | 'sidebar'
}

const EDITOR_COMPONENT_PATH: Record<
  NonNullable<HeroSlidesFieldOptions['editorVariant']>,
  string
> = {
  filmstrip: '@/fields/HeroSlides/Components/FilmstripEditor',
  sidebar: '@/fields/HeroSlides/Components/HeroSlidesSidebarEditor',
}

/**
 * One hero slide: an image, a video, or a curated WebGL shader preset,
 * selected per-row via `slideType`.
 *
 * Row admin UX is `FilmstripEditor` or `HeroSlidesSidebarEditor` (see
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
}: HeroSlidesFieldOptions): ArrayField => ({
  name,
  type: 'array',
  label: false,
  labels: {
    singular: 'Slide',
    plural: 'Slides',
  },
  minRows: 1,
  maxRows,
  admin: {
    initCollapsed: true,
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
})
