import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@/types/blocks'

/**
 * General-purpose page text. Multi-column layouts are inserted from inside the
 * editor (the `content` variant's Two-Column block) instead of being separate
 * page blocks, so a section can mix full-width and column text.
 */
export const RichTextBlock: Block = {
  slug: BlockSlug.RichText,
  interfaceName: BlockSlug.RichText,
  labels: {
    singular: 'Rich Text',
    plural: 'Rich Text',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-one-column-thumbnail.svg',
      icon: '/payload/blocks/general-one-column-icon.svg',
    },
  },
  fields: [
    RichTextField({
      name: 'content',
      editorVariant: 'content',
      overrides: {
        label: false,
      },
    }),
  ],
}
