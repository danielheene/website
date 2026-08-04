import { CollectionConfig } from 'payload'

import { cn } from '@repo/utils/cn'

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
    update: authenticated,
    create: authenticated,
    delete: authenticated,
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
    TitleField(),
    SlugField({
      fieldToUse: 'title',
    }),
    {
      type: 'row',
      admin: {
        className: cn([
          'flex flex-col',
          String.raw`[&_.group-field\_\_wrap]:grow`,
          String.raw`[&_.group-field\_\_wrap]:flex`,
          String.raw`[&_.group-field\_\_wrap]:flex-col`,
          String.raw`[&_.group-field\_\_wrap_.render-fields]:grow`,
          String.raw`[&_.group-field\_\_wrap_.render-fields]:flex`,
          String.raw`[&_.group-field\_\_wrap_.code-field]:grow`,
          String.raw`[&_.group-field\_\_wrap_.code-field]:flex`,
          String.raw`[&_.group-field\_\_wrap_.code-field]:flex-col`,
          String.raw`[&_.group-field\_\_wrap_.field-type\_\_wrap]:grow`,
        ]),
      },
      fields: [
        {
          type: 'group',
          admin: {
            width: '50%',
          },
          fields: [
            SVGUpload({
              fieldToUse: 'svg',
            }),
          ],
        },
        {
          type: 'group',
          admin: {
            width: '50%',
          },
          fields: [
            {
              type: 'code',
              name: 'svg',
              label: false,
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
                  fontFamily: 'var(--font-mono)',
                  folding: false,
                  experimentalWhitespaceRendering: 'svg',
                  contextmenu: false,
                },
                editorProps: {
                  language: 'xml',
                  height: '100%',
                },
              },
            },
          ],
        },
      ],
    },
  ],
}
