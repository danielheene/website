import { CollectionConfig } from 'payload'

import {
  hideVersionsTabForSingleVersion,
  SINGLE_VERSION_DRAFTS,
} from '@/collections/shared/singleVersionDrafts'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { RichTextField } from '@/fields/RichText'
import { authenticated } from '@/lib/access/authenticated'
import { authenticatedOrPublished } from '@/lib/access/authenticatedOrPublished'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/collection'
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
    read: authenticatedOrPublished,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    unlock: authenticated,
  },
  hooks: {
    afterOperation: [generateResumeDocumentHook],
  },
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    disableCopyToLocale: true,
    pagination: {
      defaultLimit: 50,
      limits: [50, 100],
    },
    components: {
      views: {
        edit: {
          versions: {
            tab: {
              condition: hideVersionsTabForSingleVersion,
            },
          },
        },
      },
    },
  },
  disableBulkEdit: true,
  disableDuplicate: true,
  lockDocuments: false,

  fields: [
    /* -------------- Main  Content -------------- */
    {
      type: 'row',
      fields: [
        {
          type: 'text',
          name: 'scope',
          admin: {
            width: '33%',
          },
        },
        {
          type: 'text',
          name: 'title',
          admin: {
            width: '66%',
          },
        },
      ],
    },
    RichTextField({
      name: 'description',
      editorVariant: 'markdown',
    }),

    /* -------------- Sidebar Content -------------- */
    {
      type: 'relationship',
      name: 'relatedPost',
      relationTo: [CollectionSlug.BlogPosts],
      admin: {
        appearance: 'select',
        position: 'sidebar',
      },
    },

    {
      type: 'upload',
      name: 'images',
      relationTo: [CollectionSlug.MediaImages],
      hasMany: true,
      admin: {
        position: 'sidebar',
        isSortable: true,
      },
    },

    GeneratorFlagsField(),
  ],
  trash: true,
  versions: SINGLE_VERSION_DRAFTS,
}
