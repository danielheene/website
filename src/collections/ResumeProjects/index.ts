import { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { RichTextField } from '@/fields/RichText'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

export const ResumeProjects: CollectionConfig<CollectionSlug['ResumeProjects']> = {
  slug: CollectionSlug.ResumeProjects,
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  typescript: {
    interface: 'ResumeProjectData',
  },
  access: {
    read: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
  },
  hooks: {
    afterOperation: [
      generateResumeDocumentHook,
    ],
  },
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    disableCopyToLocale: true,
  },
  disableBulkEdit: true,
  disableDuplicate: true,
  lockDocuments: false,

  fields: [
    /* -------------- Main  Content -------------- */
    {
      type: 'text',
      name: 'scope',
    },
    {
      type: 'text',
      name: 'title',
    },
    {
      type: 'upload',
      name: 'images',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
      hasMany: true,
    },
    RichTextField({
      name: 'description',
      editorVariant: 'markdown',
    }),

    /* -------------- Sidebar Content -------------- */
    {
      type: 'checkbox',
      name: 'published',
      admin: {
        position: 'sidebar',
      },
    },
    {
      type: 'relationship',
      name: 'relatedPost',
      relationTo: [
        CollectionSlug.BlogPosts,
      ],
      admin: {
        appearance: 'select',
        position: 'sidebar',
      },
    },
  ],
  trash: true,
  versions: false,
}
