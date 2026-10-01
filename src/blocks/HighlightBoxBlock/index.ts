import type { Block } from 'payload'

import { RichTextField } from '@/fields/RichText'
import { BlockGroup, BlockSlug } from '@/types/blocks'

/**
 * Bg-colored box embeddable inside a post's RichText content, for outlining
 * or calling out a part of the post. Nests a RichText field of its own
 * (markdown variant, same as the RichTextBlock/TwoColumnContentBlock columns) so
 * it can hold headings, lists, quotes, inline code and images.
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
  },
  fields: [
    RichTextField({
      name: 'content',
      editorVariant: 'markdown',
      overrides: {
        label: false,
      },
    }),
  ],
}
