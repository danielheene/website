import type { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
  OrderedListFeature,
  ParagraphFeature,
  UnorderedListFeature,
} from '@payloadcms/richtext-lexical'
import { tagInputField } from '../../fields/tagInputField'

export const TimelineBlock: Block = {
  slug: 'timelineBlock',
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'caption',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => [
          ...rootFeatures,
          FixedToolbarFeature(),
          InlineToolbarFeature(),
        ],
      }),
    },
    {
      name: 'entries',
      type: 'array',
      defaultValue: [],
      hooks: {
        beforeChange: [
          async ({ value, req }) => {
            const entries: { startDate: string }[] = Array.isArray(value) ? value : []

            return entries
              .sort((a, b) => Date.parse(b.startDate) - Date.parse(a.startDate))
              .map((data, index) => Object.assign(data, { id: index + 1 }))
          },
        ],
      },
      admin: {
        isSortable: false,
        initCollapsed: false,
        className: 'timeline',
        components: {
          RowLabel: '/payload/components/TimelineRowLabel',
        },
      },
      fields: [
        {
          type: 'row',
          admin: {
            className: 'timeline__row',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              required: true,
              admin: {
                style: { gridArea: 'title' },
              },
            },
            {
              name: 'employer',
              type: 'text',
              required: true,
              admin: {
                style: { gridArea: 'employer' },
              },
            },
            {
              name: 'startDate',
              type: 'date',
              required: true,
              admin: {
                style: { gridArea: 'startDate' },
                date: {
                  pickerAppearance: 'monthOnly',
                  displayFormat: 'MM/yyyy',
                },
              },
            },
            {
              name: 'endDate',
              type: 'date',
              required: true,
              admin: {
                style: { gridArea: 'endDate' },
                date: {
                  pickerAppearance: 'monthOnly',
                  displayFormat: 'MM/yyyy',
                },
              },
            },
          ],
        },
        {
          name: 'richText',
          type: 'richText',
          editor: lexicalEditor({
            features: ({ rootFeatures }) => [
              ...rootFeatures,
              FixedToolbarFeature(),
              InlineToolbarFeature(),
              ParagraphFeature(),
              UnorderedListFeature(),
              OrderedListFeature(),
            ],
          }),
          label: false,
        },
        tagInputField({ name: 'tech' }),
      ],
    },
  ],
  labels: {
    plural: 'Timeline Blocks',
    singular: 'Timeline Block',
  },
}
