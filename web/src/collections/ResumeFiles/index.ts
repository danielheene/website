import { AdminGroup } from '@custom-types'

import { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { CollectionSlug } from '@/types/collections'

export const ResumeFiles: CollectionConfig<CollectionSlug['ResumeFiles']> = {
  slug: CollectionSlug['ResumeFiles'],

  labels: {
    singular: 'Resume File',
    plural: 'Resume Files',
  },
  typescript: {
    interface: 'ResumeFileData',
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
  upload: {
    disableLocalStorage: true,
    withMetadata: false,
    crop: false,
    focalPoint: false,
    hideFileInputOnCreate: true,
    hideRemoveFile: true,
    mimeTypes: [
      'application/pdf',
      'image/*',
    ],
  },
  fields: [],
}
