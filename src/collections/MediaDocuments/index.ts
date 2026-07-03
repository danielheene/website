import { AdminGroup } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { generateContentURL } from '@/lib/generateContentURL'
import { CollectionSlug } from '@/types/collections'

import { generateDocumentThumbnail } from './hooks/generateDocumentThumbnail'

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
    defaultColumns: [
      'filename',
      'type',
      'extension',
      'updatedAt',
    ],
    components: {
      Description: false,
    },
  },
  folders: {
    browseByFolder: true,
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
    hideRemoveFile: true,
    displayPreview: true,
    mimeTypes: [
      'application/pdf',
    ],
    adminThumbnail: ({ doc }) => {
      const thumbnailFilename = String(doc.filename).replace(/(\.pdf)$/, '-thumbnail.png')
      return `/api/${CollectionSlug.MediaImages}/file/${thumbnailFilename}`
    },
  },

  fields: [
    {
      name: 'filename',
      type: 'text',
      label: 'File Name',
      admin: {
        disableGroupBy: true,
        disableListColumn: false,
        disableListFilter: true,
      },
    },
    {
      name: 'generator',
      type: 'text',
      hidden: true,
    },
    {
      name: 'prefix',
      type: 'text',
      label: 'Prefix',
      admin: {
        hidden: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'width',
      type: 'number',
      label: 'Width',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'height',
      type: 'number',
      label: 'Height',
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'mimeType',
      type: 'text',
      label: 'MIME Type',
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
      admin: {
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    {
      name: 'thumbnailURL',
      type: 'text',
      label: 'Thumbnail URL',
      virtual: true,
      admin: {
        hidden: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    // {
    //   name: 'blurDataURL',
    //   type: 'text',
    //   label: 'Blur Data URL',
    //   admin: {
    //     readOnly: true,
    //     disableGroupBy: true,
    //     disableListColumn: true,
    //     disableListFilter: true,
    //   },
    // },
  ],
  hooks: {
    afterChange: [
      generateDocumentThumbnail,
    ],
  },
  versions: {
    drafts: false,
    maxPerDoc: 0,
  },
}
