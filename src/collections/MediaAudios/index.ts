import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { scopeMediaAssets } from '@/fields/GeneratorFlags/baseFilter'
import { RichTextField } from '@/fields/RichText'
import { generateChecksum } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { generateThumbnail } from './hooks/generateThumbnail'

export const MediaAudios: CollectionConfig<CollectionSlug['MediaAudios']> = {
  slug: CollectionSlug['MediaAudios'],
  typescript: {
    interface: 'MediaAudio',
  },
  labels: {
    singular: 'Audio',
    plural: 'Audios',
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
    baseFilter: scopeMediaAssets,
    group: AdminGroup.Media,
    useAsTitle: 'filename',
    defaultColumns: [
      'filename',
      'type',
      'extension',
      'updatedAt',
    ],
    disableCopyToLocale: true,
    pagination: {
      defaultLimit: 50,
      limits: [
        50,
        100,
      ],
    },
    components: {
      Description: '@/components/AdminPanel/MediaScopeTabs#MediaScopeTabs',
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
      'audio/*',
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
      name: 'credits',
      editorVariant: 'caption',
    }),

    GeneratorFlagsField(),
  ],
  versions: false,
}
