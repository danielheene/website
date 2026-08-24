import type { NamedGroupField } from 'payload'

import { SHADER_PRESETS } from '@/components/HeroMedia/shaderPresets'
import { CollectionSlug } from '@/types/collections'

type HeroBackgroundFieldOptions = {
  name: string
  /** Pages' hero.media is a carousel (hasMany); BlogPosts' stays single. Defaults to true (Pages' existing behavior). */
  hasManyMedia?: boolean
}

/**
 * A hero background choosable as either uploaded media (image/video,
 * optionally a carousel) or a curated WebGL shader preset — an alternative
 * for `Pages`/`BlogPosts`' full-bleed hero.
 *
 * `shader`'s admin control is a custom field component (see
 * `./Components/FieldComponent`) — a drawer of live-rendering preset cards,
 * not Payload's default select dropdown. This field-config module must
 * never import that component directly (only its path string, via
 * `admin.components.Field`) — `payload generate:types` runs under plain
 * Node, and a transitive `@payloadcms/ui` import fails there on
 * bundler-only `.css` imports. See `src/fields/Icon/index.ts` for the
 * identical established pattern.
 */
export const HeroBackgroundField = ({
  name,
  hasManyMedia = true,
}: HeroBackgroundFieldOptions): NamedGroupField => ({
  name,
  type: 'group',
  label: false,
  admin: {
    hideGutter: true,
    disableListColumn: true,
    disableListFilter: true,
    disableGroupBy: true,
  },
  fields: [
    {
      name: 'backgroundType',
      type: 'select',
      defaultValue: 'media',
      options: [
        {
          label: 'Uploaded Media',
          value: 'media',
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
      hasMany: hasManyMedia,
      displayPreview: true,
      label: false,
      admin: {
        condition: (_, siblingData) => siblingData?.backgroundType !== 'shader',
        description: hasManyMedia
          ? 'Fills the first screen. Two or more entries become a cross-fading carousel; a single entry renders on its own.'
          : 'Fills the first screen.',
        disableListColumn: true,
        disableListFilter: true,
        disableGroupBy: true,
      },
    },
    {
      name: 'shader',
      type: 'select',
      options: SHADER_PRESETS.map((preset) => ({
        label: preset.label,
        value: preset.key,
      })),
      admin: {
        condition: (_, siblingData) => siblingData?.backgroundType === 'shader',
        disableListColumn: true,
        disableListFilter: true,
        disableGroupBy: true,
        components: {
          Field: {
            path: '@/fields/HeroBackground/Components/FieldComponent',
          },
        },
      },
    },
  ],
})
