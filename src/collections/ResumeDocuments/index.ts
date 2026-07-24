import { CollectionConfig } from 'payload'

import dedent from 'dedent'

import { authenticated } from '@/access/authenticated'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

const adminDefaults = {
  allowCreate: false,
  allowEdit: false,
  readOnly: true,
  isSortable: false,
  disableBulkEdit: true,
  disableGroupBy: true,
  disableListFilter: true,
  disableListColumn: true,
}

export const ResumeDocuments: CollectionConfig<CollectionSlug['ResumeDocuments']> = {
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
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    defaultColumns: [
      'title',
      'slug',
      'createdAt',
    ],
    disableCopyToLocale: true,
  },
  defaultSort: [
    'createdAt',
  ],
  fields: [
    TitleField({
      listViewThumbnailPath: 'thumbnails_en.0',
    }),
    SlugField({
      fieldToUse: 'title',
    }),
    {
      type: 'text',
      name: 'createdAt',
      label: 'Creation Date',
      admin: {
        hidden: false,
        position: 'sidebar',
      },
    },
    {
      type: 'relationship',
      name: 'jobId',
      relationTo: CollectionSlug.PayloadJobs,
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
    },
    {
      type: 'text',
      name: 'checksum_en',
      label: 'Document Checksum [EN]',
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
    },
    {
      type: 'text',
      name: 'checksum_de',
      label: 'Document Checksum [DE]',
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
    },

    {
      type: 'group',
      label: 'Generated Documents',
      admin: {
        hideGutter: true,
        description: dedent`
          The following data was generated during the resume generation process and used to create the resume.
        `,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
        },
      },
      fields: [
        {
          type: 'tabs',
          admin: {
            className: 'tabs-field--vertical',
          },
          tabs: [
            {
              label: 'English',
              fields: [
                {
                  type: 'upload',
                  name: 'document_en',
                  label: false,
                  relationTo: [
                    CollectionSlug.ResumeFiles,
                  ],
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
            {
              label: 'German',
              fields: [
                {
                  type: 'upload',
                  name: 'document_de',
                  label: false,
                  relationTo: [
                    CollectionSlug.ResumeFiles,
                  ],
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      type: 'group',
      label: 'Generated Thumbnails',
      admin: {
        hideGutter: true,
        description: dedent`
          The following data was generated during the resume generation process and used to create the resume.
        `,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
        },
      },
      fields: [
        {
          type: 'tabs',
          admin: {
            className: 'tabs-field--vertical',
          },
          tabs: [
            {
              label: 'English',
              fields: [
                {
                  type: 'upload',
                  name: 'thumbnails_en',
                  label: false,
                  relationTo: [
                    CollectionSlug.ResumeFiles,
                  ],
                  hasMany: true,
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
            {
              label: 'German',
              fields: [
                {
                  type: 'upload',
                  name: 'thumbnails_de',
                  label: false,
                  relationTo: [
                    CollectionSlug.ResumeFiles,
                  ],
                  hasMany: true,
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
          ],
        },
      ],
    },

    {
      type: 'group',
      label: 'Generated Data',
      admin: {
        hideGutter: true,
        description: dedent`
          The following data was generated during the resume generation process and used to create the resume.
        `,
        components: {
          Description: '@/components/AdminPanel#MarkdownDescription',
        },
      },
      fields: [
        {
          type: 'tabs',
          admin: {
            className: 'tabs-field--vertical',
          },
          tabs: [
            {
              label: 'English',
              fields: [
                {
                  type: 'code',
                  name: 'data_en',
                  label: false,
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
            {
              label: 'German',
              fields: [
                {
                  type: 'code',
                  name: 'data_de',
                  label: false,
                  admin: {
                    ...adminDefaults,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
