import { AdminGroup } from '@custom-types'
import type { CollectionConfig } from 'payload'

import { SlugField } from '@/fields/Slug'
import { CollectionSlug } from '@/types/collections'

export const ResumeSkills: CollectionConfig<CollectionSlug.ResumeSkills> = {
  slug: CollectionSlug.ResumeSkills,
  labels: {
    singular: 'Skill',
    plural: 'Skills',
  },
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Resume,
    defaultColumns: [
      'name.en',
      'slug',
      'type',
    ],
    disableCopyToLocale: true,
  },
  defaultSort: [
    'type',
    'name.en',
  ],
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
  fields: [
    {
      type: 'group',
      name: 'name',
      label: 'Name',
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              type: 'text',
              name: 'en',
              label: 'English',
              required: true,
              admin: {
                width: '50%',
              },
            },
            {
              type: 'text',
              name: 'de',
              label: 'German',
              required: true,
              admin: {
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    {
      type: 'text',
      name: 'title',
      virtual: 'name.en',
      admin: {
        hidden: true,
      },
    },
    SlugField({
      fieldToUse: 'name.en',
    }),
    {
      name: 'type',
      type: 'select',
      options: [
        {
          label: 'Programming Language',
          value: 'programmingLanguage',
        },
        {
          label: 'Framework',
          value: 'framework',
        },
        {
          label: 'Technology',
          value: 'technology',
        },
        {
          label: 'Methodology',
          value: 'methodology',
        },
        {
          label: 'Private Interest',
          value: 'privateInterest',
        },
      ],
      defaultValue: 'technology',
      admin: {
        position: 'sidebar',
      },
    },
  ],
  timestamps: false,
  trash: false,
}
