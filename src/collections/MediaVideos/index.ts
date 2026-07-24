import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
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
      name: 'caption',
      editorVariant: 'caption',
    }),
  ],
  versions: false,
}
