import { Block } from 'payload'
import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

export const LogoCloudBlock: Block = {
  slug: 'logoCloudBlock',
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
      admin: {
        isSortable: false,
        initCollapsed: false,
        className: 'logo-cloud',
        components: {
          RowLabel: '/payload/components/LogoCloudItemLabel',
        },
      },
      fields: [
        {
          name: 'logo',
          type: 'upload',
          label: false,
          relationTo: 'media',
          admin: {
            className: 'logo-cloud__logo',
          },
          filterOptions: {
            mimeType: { contains: 'svg' },
          },
        },
      ],
    },
  ],
}
