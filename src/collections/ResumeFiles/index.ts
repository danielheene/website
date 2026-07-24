import { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { generateChecksum } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

export const ResumeFiles: CollectionConfig<CollectionSlug['ResumeFiles']> = {
  slug: CollectionSlug.ResumeFiles,
  typescript: {
    interface: 'ResumeFileData',
  },
  labels: {
    singular: 'Resume File',
    plural: 'Resume Files',
  },
  hooks: {
    beforeChange: [
      generateChecksum,
    ],
  },
  admin: {
    group: AdminGroup.Resume,
    useAsTitle: 'filename',
    defaultColumns: [
      // 'employer',
      // 'title',
      // 'startDate',
      // 'endDate',
      // 'interval',
    ],
    disableCopyToLocale: true,
    components: {
      Description: false,
    },
  },
  access: {
    read: anyone,
    admin: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
    readVersions: authenticated,
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
  ],
}
