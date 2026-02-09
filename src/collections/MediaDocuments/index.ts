import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { CollectionConfig } from 'payload'

export const MediaDocuments: CollectionConfig<CollectionSlug.MediaDocuments> = {
  slug: CollectionSlug.MediaDocuments,
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  admin: {
    disableCopyToLocale: true,
    group: AdminGroup.General,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'type', 'extension', 'updatedAt'],
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
    mimeTypes: ['application/pdf'],
  },
  fields: [
    RichTextField({
      name: 'caption',
      editorVariant: 'caption',
    }),
  ],
}
