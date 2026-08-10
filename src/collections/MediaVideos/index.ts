import type { CollectionConfig } from 'payload'

import { isArray, isString } from 'lodash-es'
import { flat } from 'tailwind-variants/utils'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { hideGeneratedAssets } from '@/fields/GeneratorFlags/baseFilter'
import { MediaField } from '@/fields/Media'
import { RichTextField } from '@/fields/RichText'
import { generateChecksum } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { generateThumbnail } from './hooks/generateThumbnail'

export const MediaVideos: CollectionConfig<CollectionSlug['MediaVideos']> = {
  slug: CollectionSlug.MediaVideos,
  typescript: {
    interface: 'MediaVideo',
  },
  labels: {
    singular: 'Video',
    plural: 'Videos',
  },
  hooks: {
    beforeChange: [
      generateChecksum,
    ],
    afterChange: [
      generateThumbnail,
    ],
  },
  admin: {
    baseFilter: hideGeneratedAssets,
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: [
      'filename',
      'type',
      'extension',
      'updatedAt',
    ],
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
    mimeTypes: [
      'video/*',
    ],
    adminThumbnail: ({ doc }) => {
      if (Array.isArray(doc.thumbnails) && doc.thumbnails.length > 0) {
        const thumbnailFilename = String(doc.filename).replace(/\.[^/.]+$/, '-thumbnail.png')
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

    RichTextField({
      name: 'credits',
      editorVariant: 'caption',
    }),

    MediaField({
      name: 'thumbnails',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
      hasMany: true,
      readOnly: true,
      allowCreate: false,
    }),

    GeneratorFlagsField(),
  ],
  versions: false,
}
