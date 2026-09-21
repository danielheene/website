import { CollectionConfig } from 'payload'

import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generateResumeDocumentHook } from '@/lib/hooks/collection'
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
}
