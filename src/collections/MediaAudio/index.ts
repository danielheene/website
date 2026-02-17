import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { CollectionConfig } from 'payload'

export const MediaAudio: CollectionConfig<CollectionSlug.MediaAudio> = {
  slug: CollectionSlug.MediaAudio,
  labels: {
    singular: 'Audio',
    plural: 'Audios',
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
    mimeTypes: ['audio/*'],
  },
  fields: [
    RichTextField({
      name: 'caption',
      editorVariant: 'caption',
    }),
  ],
}
