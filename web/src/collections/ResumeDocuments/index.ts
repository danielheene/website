import { CollectionConfig, Field, RowField } from 'payload'

import { AdminGroup } from '@custom-types'

import { authenticated } from '@/access/authenticated'
import { SlugField } from '@/fields/Slug'
import TitleField from '@/fields/Title'
import { CollectionSlug } from '@/types/collections'

const createLocalizedRow = (
  field: Extract<
    Field,
    {
      name: string
    }
  >,
): RowField => ({
  type: 'row',
  fields: [
    {
      ...field,
      name: `${field.name}_en`,
      label: `${field.label || field.name} - English`,
    },
    {
      ...field,
      name: `${field.name}_de`,
      label: `${field.label || field.name} - German`,
    },
  ],
})

const adminDefaults = {
  allowCreate: false,
  readOnly: true,
  isSortable: false,
  disableBulkEdit: true,
  disableGroupBy: true,
  disableListFilter: true,
  disableListColumn: true,
}

export const ResumeDocuments: CollectionConfig<CollectionSlug['ResumeDocuments']> = {
  slug: CollectionSlug['ResumeDocuments'],
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  typescript: {
    interface: 'ResumeDocumentData',
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
  hooks: {
    afterChange: [],
  },
  admin: {
    // useAsTitle: 'employer',
    group: AdminGroup.Resume,
    defaultColumns: [
      // 'employer',
      // 'title',
      // 'startDate',
      // 'endDate',
      // 'interval',
    ],
    disableCopyToLocale: true,
  },
  defaultSort: [
    // 'startDate',
  ],
  fields: [
    TitleField({
      listViewThumbnailPath: 'thumbnails_en.0',
    }),
    SlugField({
      fieldToUse: 'title',
    }),
    {
      type: 'group',
      fields: [
        createLocalizedRow({
          type: 'text',
          name: 'checksum',
          label: 'Checksum',
          admin: {
            ...adminDefaults,
          },
        }),
        createLocalizedRow({
          type: 'upload',
          name: 'document',
          label: 'Document',
          relationTo: [
            CollectionSlug['ResumeFiles'],
          ],
          admin: {
            ...adminDefaults,
          },
        }),
        createLocalizedRow({
          type: 'upload',
          name: 'thumbnails',
          label: 'Thumbnails',
          relationTo: [
            CollectionSlug['ResumeFiles'],
          ],
          hasMany: true,
          admin: {
            ...adminDefaults,
          },
        }),
      ],
    },
    {
      type: 'collapsible',
      label: 'Data',
      fields: [
        createLocalizedRow({
          type: 'code',
          name: 'data',
          label: 'Used Data',
          admin: {
            ...adminDefaults,
          },
        }),
      ],
    },
  ],
}
