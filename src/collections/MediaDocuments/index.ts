import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { MediaField } from '@/fields/Media'
import { generateChecksum } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { generateThumbnails } from './hooks/generateThumbnails'

export const MediaDocuments: CollectionConfig<CollectionSlug['MediaDocuments']> = {
  slug: CollectionSlug.MediaDocuments,
  typescript: {
    interface: 'MediaDocument',
  },
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  enableQueryPresets: true,
  hooks: {
    beforeChange: [
      generateChecksum,
    ],
    afterChange: [
      generateThumbnails,
    ],
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
      if (Array.isArray(doc.thumbnails) && doc.thumbnails.length > 0) {
        const thumbnailFilename = String(doc.filename).replace(/\.[^/.]+$/, '-1-thumbnail.png')
        return `/api/${CollectionSlug.MediaImages}/file/${thumbnailFilename}`
      }
      // return `/api/${CollectionSlug['MediaImages']}/file/${thumbnailFilename}`
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
      name: 'checksum',
      type: 'text',
      label: 'Checksum',
      index: true,
      admin: {
        readOnly: true,
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
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
    MediaField({
      name: 'thumbnails',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
      hasMany: true,
      readOnly: true,
      allowCreate: false,
    }),
    // {
    //   name: 'thumbnails',
    //   type: 'upload',
    //   label: 'Thumbnails',
    //   relationTo: [
    //     CollectionSlug.MediaImages,
    //   ],
    //   hasMany: true,
    //   admin: {
    //     readOnly: true,
    //     allowCreate: false,
    //     disableGroupBy: true,
    //     disableListColumn: true,
    //     disableListFilter: true,
    //   },
    // },
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

    GeneratorFlagsField(),
  ],
  versions: false,
}
