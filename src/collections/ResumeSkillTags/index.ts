import { CollectionConfig } from 'payload'

import {
  hideVersionsTabForSingleVersion,
  SINGLE_VERSION_DRAFTS,
} from '@/collections/shared/singleVersionDrafts'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { authenticated } from '@/lib/access/authenticated'
import { generateResumeDocumentHook } from '@/lib/payloadHooks/collection'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'

export const ResumeSkillTags: CollectionConfig<CollectionSlug['ResumeSkillTags']> = {
  slug: CollectionSlug.ResumeSkillTags,
  labels: {
    singular: 'Skill Tag',
    plural: 'Skill Tags',
  },
  typescript: {
    interface: 'ResumeSkillTagData',
  },
  access: {
    read: authenticated,
    update: authenticated,
    create: authenticated,
    delete: authenticated,
    readVersions: authenticated,
  },
  hooks: {
    afterOperation: [
      generateResumeDocumentHook,
    ],
  },
  orderable: true,
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    defaultColumns: [
      'title',
      'slug',
      'interval',
    ],
    disableCopyToLocale: true,
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
  fields: [
    TitleField({
      overrides: {
        label: 'Title',
      },
    }),

    SlugField({
      fieldToUse: 'title',
    }),

    {
      type: 'number',
      name: 'interval',
      label: 'Employment (months)',
      admin: {
        readOnly: true,
        position: 'sidebar',
      },
    },

    GeneratorFlagsField(),
  ],
  versions: SINGLE_VERSION_DRAFTS,
}
