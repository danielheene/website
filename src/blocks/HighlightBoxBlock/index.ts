import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@/types/blocks'

/**
 * Bg-colored box embeddable inside a post's RichText content, for outlining
 * or calling out a part of the post. Nests a RichText field of its own
 * (content variant) so it can hold headings, lists, quotes, inline code and
 * images.
 */
export const HighlightBoxBlock: Block = {
  slug: BlockSlug.HighlightBox,
  interfaceName: BlockSlug.HighlightBox,
  labels: {
    singular: 'Highlight Box',
    plural: 'Highlight Boxes',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-highlight-box-thumbnail.svg',
      icon: '/payload/blocks/general-highlight-box-icon.svg',
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
