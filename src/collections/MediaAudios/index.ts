import { AdminGroup } from '@custom-types'

import type { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { CollectionSlug } from '@/types/collections'

export const MediaAudios: CollectionConfig<CollectionSlug['MediaAudios']> = {
  slug: CollectionSlug['MediaAudios'],
  typescript: {
    interface: 'MediaAudio',
  },
  labels: {
    singular: 'Audio',
    plural: 'Audios',
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
      'audio/*',
    ],
  },
  fields: [
    RichTextField({
      name: 'caption',
      editorVariant: 'caption',
    }),
  ],
  versions: {
    drafts: false,
    maxPerDoc: 10,
  },
}
