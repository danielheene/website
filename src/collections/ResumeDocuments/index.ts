import { CollectionConfig, JSONField } from 'payload'

import dedent from 'dedent'
import { cn } from 'tailwind-variants'

import { authenticated } from '@/access/authenticated'
import { forbidden } from '@/access/forbidden'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generateContentURL } from '@/lib/generateContentURL'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

import { storeLatestResumeDocumentSlug } from './hooks/storeLatestResumeDocumentSlug'

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

const codeDefaults = {
  editorOptions: {
    readOnly: true,
    fontFamily: 'var(--font-mono)',
    contextmenu: false,
  } as JSONField['admin']['editorOptions'],
} as JSONField['admin']

const uploadDefaults = {
  className: cn([
    '[&_.pill]:hidden',
    '[&.read-only_.dropzone]:hidden',
    String.raw`[&.read-only_.upload.upload--has-many\_\_drag]:hidden`,
    String.raw`[&.read-only_.upload-relationship-details\_\_details]:mr-0`,
  ]),
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
  disableDuplicate: true,
  disableBulkDelete: true,
  disableBulkEdit: true,
  versions: false,
  timestamps: false,
  access: {
    read: authenticated,
    update: forbidden,
    create: forbidden,
    delete: forbidden,
  },
  hooks: {
    afterChange: [
      storeLatestResumeDocumentSlug,
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    livePreview: {
      url: ({ data }) =>
        generateContentURL({
          collection: CollectionSlug.ResumeDocuments,
          slug: data?.slug,
        }),
    },
    defaultColumns: [
      'title',
      'slug',
      'createdAt',
    ],
    disableCopyToLocale: true,
    pagination: {
      defaultLimit: 100,
      limits: [
        100,
      ],
    },
  },
  defaultSort: [
    '-createdAt',
  ],
  fields: [
    TitleField({
      listViewThumbnailPath: 'thumbnails_en.0.value',
    }),
    SlugField({
      fieldToUse: 'title',
    }),
    {
      type: 'date',
      name: 'createdAt',
      label: 'Creation Date',

      admin: {
        date: {
          displayFormat: 'yyyy-MM-dd - HH:mm:ss',
        },
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
      index: true,
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
    },
    {
      type: 'text',
      name: 'checksum_de',
      label: 'Document Checksum [DE]',
      index: true,
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
    },
    {
      type: 'number',
      name: 'newerVersions',
      label: 'Newer Versions',
      admin: {
        ...adminDefaults,
        position: 'sidebar',
      },
      hooks: {
        afterRead: [
          async ({ req, data, value }) => {
            console.log('data', data)
            console.log('value', value)
            const { docs } = await req.payload.find({
              collection: CollectionSlug.ResumeDocuments,
              pagination: false,
              limit: 0,
              where: {
                createdAt: {
                  greater_than_equal: value?.createdAt,
                },
              },
            })
            return Array.isArray(docs) ? docs.length - 1 : 0
          },
        ],
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
          type: 'upload',
          name: 'document_en',
          label: 'EN',
          relationTo: [
            CollectionSlug.MediaDocuments,
          ],
          admin: {
            ...adminDefaults,
            ...uploadDefaults,
          },
        },
        {
          type: 'upload',
          name: 'document_de',
          label: 'DE',
          relationTo: [
            CollectionSlug.MediaDocuments,
          ],
          admin: {
            ...adminDefaults,
            ...uploadDefaults,
          },
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
          type: 'row',
          fields: [
            {
              type: 'upload',
              name: 'thumbnails_en',
              label: 'EN',
              relationTo: [
                CollectionSlug.MediaImages,
              ],
              hasMany: true,
              admin: {
                ...adminDefaults,
                ...uploadDefaults,
                width: '50%',
              },
            },
            {
              type: 'upload',
              name: 'thumbnails_de',
              label: 'DE',
              relationTo: [
                CollectionSlug.MediaImages,
              ],
              hasMany: true,
              admin: {
                ...adminDefaults,
                ...uploadDefaults,
                width: '50%',
              },
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
          tabs: [
            {
              label: 'English',
              fields: [
                {
                  type: 'json',
                  name: 'data_en',
                  label: false,
                  admin: {
                    ...adminDefaults,
                    ...codeDefaults,
                  },
                },
              ],
            },
            {
              label: 'German',
              fields: [
                {
                  type: 'json',
                  name: 'data_de',
                  label: false,
                  admin: {
                    ...adminDefaults,
                    ...codeDefaults,
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
