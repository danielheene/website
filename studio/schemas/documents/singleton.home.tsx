import { Icon } from '@iconify/react';
import { defineArrayMember, defineField, defineType } from 'sanity';
import { COL_FIELDSET_NAME, COL_FIELDSETS, FieldConfig } from '../_shared';

export default defineType({
  title: 'Home',
  name: 'singleton.home',
  type: 'document',
  icon: () => <Icon icon='carbon:home' />,
  groups: [
    {
      name: 'main',
      title: 'Main',
      default: true,
    },
    {
      name: 'projects',
      title: 'Projects',
    },
    {
      name: 'services',
      title: 'Services',
    },
    {
      name: 'qualifications',
      title: 'Qualifications',
    },
    {
      name: 'customers',
      title: 'Customers',
    },
    {
      title: 'Meta',
      name: 'meta',
    },
  ],
  fields: [
    defineField({
      title: 'Hero Stage',
      name: 'heroStage',
      type: 'object',
      group: 'main',
      fields: [
        defineField({
          title: 'Headline',
          name: 'headline',
          type: 'text',
          rows: 2,
          initialValue: '',
        }),
        defineField({
          title: 'Sub Headline',
          name: 'subHeadline',
          type: 'array',
          initialValue: [],
          of: [defineArrayMember({ type: 'string' })],
        }),
        defineField({
          title: 'Portrait',
          name: 'portrait',
          type: 'image',
          options: {
            hotspot: true,
            storeOriginalFilename: true,
            metadata: ['lqip', 'palette'],
          },
        }),
      ],
    }),
    defineField({
      title: 'Projects',
      name: 'projectTeaser',
      type: 'object',
      options: {},
      group: 'projects',
      fieldsets: COL_FIELDSETS,
      fields: [
        defineField({
          title: 'Section Header',
          name: 'header',
          type: 'sectionHeader',
        }),
        defineField({
          title: 'Project #01',
          name: 'projectOne',
          type: 'reference',
          options: {
            disableNew: true,
            filter: 'published == true',
          },
          to: [{ type: 'projects.project' }],
          fieldset: COL_FIELDSET_NAME['6-6'],
        }),
        defineField({
          title: 'Project #02',
          name: 'projectTwo',
          type: 'reference',
          options: {
            disableNew: true,
            filter: 'published == true',
          },
          to: [{ type: 'projects.project' }],
          fieldset: COL_FIELDSET_NAME['6-6'],
        }),
        defineField({
          title: 'Project #03',
          name: 'projectThree',
          type: 'reference',
          options: {
            disableNew: true,
            filter: 'published == true',
          },
          to: [{ type: 'projects.project' }],
          fieldset: COL_FIELDSET_NAME['6-6'],
        }),
        defineField({
          title: 'Project #04',
          name: 'projectFour',
          type: 'reference',
          options: {
            disableNew: true,
            filter: 'published == true',
          },
          to: [{ type: 'projects.project' }],
          fieldset: COL_FIELDSET_NAME['6-6'],
        }),
      ],
    }),
    defineField({
      title: 'Services',
      name: 'services',
      type: 'section.services',
      group: 'services',
    }),
    defineField({
      title: 'Qualifications',
      name: 'qualifications',
      type: 'section.qualifications',
      group: 'qualifications',
    }),
    defineField({
      title: 'Customers Marquee',
      name: 'customers',
      type: 'section.customers',
      group: 'customers',
    }),
    defineField({ ...FieldConfig.Title, group: 'meta' }),
    defineField({ ...FieldConfig.SlugInput, group: 'meta' }),
    defineField({ ...FieldConfig.MetaDescription, group: 'meta' }),
    defineField({ ...FieldConfig.MetaKeywords, group: 'meta' }),
    defineField({ ...FieldConfig.MetaTags, group: 'meta' }),
  ],
  preview: {
    prepare: () => ({
      title: 'Home',
    }),
  },
});
