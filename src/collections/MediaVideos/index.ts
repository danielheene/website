import { AdminGroup } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { CollectionSlug } from '@/types/collections'

export const MediaVideos: CollectionConfig<CollectionSlug.MediaVideos> = {
  slug: CollectionSlug.MediaVideos,
  typescript: {
    interface: 'MediaVideo',
  },
  labels: {
    singular: 'Video',
    plural: 'Videos',
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
    mimeTypes: [
      'video/*',
    ],
  },
  fields: [
    RichTextField({
      name: 'caption',
      editorVariant: 'caption',
    }),
    {
      name: 'prefix',
      type: 'text',
    },
  ],
}
