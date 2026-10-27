import type { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@website/types/blocks'
import { cn } from 'tailwind-variants'

import { RichTextField } from '@/fields/RichText'

export const TwoColumnContentBlock: Block = {
  slug: BlockSlug.TwoColumnContent,
  interfaceName: BlockSlug.TwoColumnContent,
  labels: {
    singular: 'Two-Column Content',
    plural: 'Two-Column Content',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
    images: {
      thumbnail: '/payload/blocks/general-two-column-thumbnail.svg',
      icon: '/payload/blocks/general-two-column-icon.svg',
    },
    components: {
      // Renders the columns inline, without the block's collapsible header.
      Block: '@/blocks/TwoColumnContentBlock/components/ColumnsBlock#ColumnsBlock',
    },
  },
  fields: [
    {
      type: 'row',
      admin: {
        className: cn(['[&>.render-fields]:mb-1']),
      },
      fields: [
        {
          name: 'verticalAlignment',
          type: 'select',
          label: false,
          defaultValue: 'start',
          options: [
            { label: 'Vertical Align: Top', value: 'start' },
            { label: 'Vertical Align: Center', value: 'center' },
            { label: 'Vertical Align: End', value: 'end' },
          ],
          admin: {
            width: '50%',
          },
        },
        {
          name: 'orderMobile',
          type: 'select',
          label: false,
          defaultValue: 'normal',
          options: [
            { label: 'Order Mobile: Normal', value: 'normal' },
            { label: 'Order Mobile: Reversed', value: 'reversed' },
          ],
          admin: {
            width: '50%',
          },
        },
      ],
    },
    {
      type: 'row',
      admin: {
        className: 'lg:*:mb-0',
      },
      fields: [
        RichTextField({
          name: 'contentLeft',
          editorVariant: 'post',
          overrides: {
            label: false,
            admin: {
              width: '50%',
            },
          },
        }),
        RichTextField({
          name: 'contentRight',
          editorVariant: 'post',
          overrides: {
            label: false,
            admin: {
              width: '50%',
            },
          },
        }),
      ],
    },
  ],
}
