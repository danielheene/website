import { AdminGroup } from '@custom-types'

import { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { CollectionSlug } from '@/types/collections'

export const ResumeDocuments: CollectionConfig<CollectionSlug.ResumeDocuments> = {
  slug: CollectionSlug.ResumeDocuments,
  labels: {
    singular: 'Document',
    plural: 'Documents',
  },
  typescript: {
    interface: 'ResumeDocumentData',
  },
  access: {
    read: authenticated,
    admin: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    afterChange: [],
  },
  admin: {
    // useAsTitle: 'employer',
    group: AdminGroup.Resume,
    defaultColumns: [
      // 'employer',
      // 'title',
      // 'startDate',
      // 'endDate',
      // 'interval',
    ],
    disableCopyToLocale: true,
  },
  defaultSort: [
    // 'startDate',
  ],
  fields: [

  ],
}
