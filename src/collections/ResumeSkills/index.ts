import { CollectionConfig } from 'payload'
import { CollectionSlug, AdminGroup } from '@custom-types'
import { SlugField } from '@/fields/Slug'


export const ResumeSkills: CollectionConfig<CollectionSlug.ResumeSkills> = {
  slug: CollectionSlug.ResumeSkills,
  labels: {
    singular: 'Skill',
    plural: 'Skills',
  },
  admin: {
    useAsTitle: 'name',
    group: AdminGroup.Resume,
    defaultColumns: ['name', 'slug', 'type'],
    disableCopyToLocale: true,
    components: {
      edit: {
        beforeDocumentControls: ['@/components/AdminPanel#LanguageToggle'],
      },
    },
  },
  defaultSort: ['type', 'name'],
  defaultPopulate: {
    name: true,
    slug: true,
    type: true,
  },
  disableDuplicate: true,
  forceSelect: {
    name: true,
    slug: true,
    type: true,
  },
  indexes: [{
    unique: true,
    fields: ['slug', 'type'],
  }],
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      localized: true,
    },
    SlugField({ fieldToUse: 'name' }),
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Skill', value: 'skill' },
        { label: 'Tool', value: 'tool' },
        { label: 'Language', value: 'language' },
        { label: 'Framework', value: 'framework' },
      ],
      defaultValue: 'skill',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: false,
  trash: false,
}
