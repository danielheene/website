import { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { SlugField } from '@/fields/Slug'
import { SVGUpload } from '@/fields/SVGUpload'
import { TitleField } from '@/fields/Title'
import { CollectionSlug } from '@/types/collections'

export const ResumeCustomers: CollectionConfig<CollectionSlug['ResumeCustomers']> = {
  slug: CollectionSlug.ResumeCustomers,
  labels: {
    singular: 'Customer',
    plural: 'Customers',
  },
  typescript: {
    interface: 'ResumeCustomerData',
  },
  access: {
    read: authenticated,
    admin: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
    readVersions: authenticated,
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'slug',
    ],
  },
  orderable: true,
  fields: [
    {
      type: 'row',
      fields: [
        {
          type: 'group',
          admin: {
            width: '50%',
            hideGutter: true,
          },
          fields: [
            TitleField(),
            SlugField({
              fieldToUse: 'title',
            }),
            {
              type: 'code',
              name: 'svg',
              label: 'SVG Content',
              admin: {
                disableBulkEdit: true,
                disableListColumn: true,
                disableGroupBy: true,
                disableListFilter: true,
                language: 'xml',
                editorOptions: {
                  fontSize: 14,
                  readOnly: true,
                  lineNumbers: 'off',
                  folding: false,
                  experimentalWhitespaceRendering: 'svg',
                  contextmenu: false,
                },
                editorProps: {
                  language: 'xml',
                  height: 400,
                },
              },
            },
          ],
        },
        {
          type: 'group',
          admin: {
            width: '50%',
            hideGutter: true,
          },
          fields: [
            SVGUpload({
              fieldToUse: 'svg',
            }),
          ],
        },
      ],
    },
  ],
}
