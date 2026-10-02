import type { Block } from 'payload'

import { LinkField } from '@/fields/Link'
import { BlockGroup, BlockSlug } from '@/types/blocks'
import { CollectionSlug } from '@/types/collections'

export const FEATURE_CARD_SIZES = ['third', 'half', 'twoThirds', 'full'] as const
export type FeatureCardSize = (typeof FEATURE_CARD_SIZES)[number]

export const FEATURE_CARD_COLORS = ['primary', 'rose', 'violet', 'sky', 'teal', 'amber'] as const
export type FeatureCardColor = (typeof FEATURE_CARD_COLORS)[number]

/**
 * A bento grid of large gradient cards, each with a headline, a short text,
 * an optional screenshot bleeding off its bottom-right corner and an optional
 * link that makes the whole card clickable. Built as a teaser section, e.g.
 * the home page's pointers to the resume page, downloader and validator.
 */
export const FeatureCardsBlock: Block = {
  slug: BlockSlug.FeatureCards,
  interfaceName: BlockSlug.FeatureCards,
  labels: {
    singular: 'Feature Cards',
    plural: 'Feature Cards',
  },
  admin: {
    group: BlockGroup.General,
    disableBlockName: true,
  },
  fields: [
    {
      name: 'heading',
      type: 'text',
      label: 'Heading',
      admin: {
        description: 'Optional heading shown above the cards.',
      },
    },
    {
      name: 'cards',
      type: 'array',
      label: 'Cards',
      minRows: 1,
      maxRows: 6,
      labels: {
        singular: 'Card',
        plural: 'Cards',
      },
      admin: {
        initCollapsed: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'size',
              type: 'select',
              label: 'Width',
              required: true,
              defaultValue: 'third',
              options: [
                {
                  label: 'One third',
                  value: 'third',
                },
                {
                  label: 'Half',
                  value: 'half',
                },
                {
                  label: 'Two thirds',
                  value: 'twoThirds',
                },
                {
                  label: 'Full width',
                  value: 'full',
                },
              ],
              admin: {
                width: '50%',
                description: 'On wide screens. Cards stack on phones.',
              },
            },
            {
              name: 'color',
              type: 'select',
              label: 'Color',
              required: true,
              defaultValue: 'primary',
              options: FEATURE_CARD_COLORS.map((color) => ({
                label: color[0].toUpperCase() + color.slice(1),
                value: color,
              })),
              admin: {
                width: '50%',
              },
            },
          ],
        },
        {
          name: 'title',
          type: 'textarea',
          label: 'Title',
          required: true,
          admin: {
            rows: 2,
            description: 'Line breaks are kept.',
          },
        },
        {
          name: 'text',
          type: 'textarea',
          label: 'Text',
          admin: {
            rows: 3,
          },
        },
        {
          name: 'image',
          type: 'upload',
          label: 'Image',
          relationTo: CollectionSlug.MediaImages,
          admin: {
            description:
              'Optional screenshot, shown bleeding off the bottom-right corner of the card.',
          },
        },
        LinkField({
          overrides: {
            label: 'Link',
            admin: {
              description: 'Optional. Makes the whole card clickable.',
            },
          },
        }),
      ],
    },
  ],
}
