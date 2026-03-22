import { AdminGroup, CollectionSlug } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { customAlphabet } from 'nanoid'

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz0123456789', 10)

export const MediaDocuments: CollectionConfig<CollectionSlug.MediaDocuments> = {
  slug: CollectionSlug.MediaDocuments,
  typescript: {
    interface: 'MediaDocument',
  },
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  admin: {
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
    disableCopyToLocale: true,
    components: {
      Description: false,
    },
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  upload: {
    disableLocalStorage: true,
    withMetadata: false,
    mimeTypes: ['application/pdf'],
  },
  fields: [
    {
      name: 'documentKey',
      type: 'text',
      label: 'Document Key which does not change between filename changes or uploads',
      unique: true,
      minLength: 10,
      defaultValue: () => `generated:${nanoid()}`,
      admin: {
        hidden: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'thumbnail',
      type: 'upload',
      label: 'Thumbnail',
      relationTo: CollectionSlug.MediaImages,
    },
    {
      name: 'thumbnailURL',
      type: 'text',
      label: 'Thumbnail URL',
      virtual: 'thumbnail.url',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'blurDataURL',
      type: 'text',
      label: 'Blur Data URL',
      virtual: 'thumbnail.blurDataURL',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
  ],
  hooks: {

    afterChange: [
      async ({ operation, req, data, doc }) => {
        console.log('operation:', operation)
        console.log('data:', data)
        console.log('doc:', doc)
        if (operation === 'create' && req.file) {
          console.log('File uploaded successfully:', req.file.name)
        }
      },
    ],
  },
  versions: {
    drafts: false,
    maxPerDoc: 0,
  },
}
