import { Icon } from '@iconify/react';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { SanityPreviewWithPublishedLabel } from '../../components';
import { COL_FIELDSET_NAME, COL_FIELDSETS } from '../_shared';

export default defineType({
  title: 'Qualification',
  name: 'section.qualifications',
  type: 'object',
  options: {
    modal: {
      type: 'dialog',
    },
  },
  fields: [
    defineField({
      title: 'Section Header',
      name: 'header',
      type: 'sectionHeader',
    }),
    defineField({
      title: 'Entries',
      name: 'entries',
      type: 'array',
      initialValue: [],
      of: [
        defineArrayMember({
          title: 'Qualification Block',
          name: 'block.qualification',
          type: 'object',
          options: {},
          fields: [
            defineField({
              title: 'Published',
              name: 'published',
              type: 'boolean',
              initialValue: true,
            }),
            defineField({
              title: 'Job Title',
              name: 'title',
              type: 'string',
              initialValue: '',
            }),
            defineField({
              title: 'Employer',
              name: 'employer',
              type: 'string',
              initialValue: '',
              fieldset: COL_FIELDSET_NAME['6-6'],
            }),
            defineField({
              title: 'Location',
              name: 'location',
              type: 'string',
              initialValue: '',
              fieldset: COL_FIELDSET_NAME['6-6'],
            }),
            defineField({
              title: 'Start',
              name: 'start',
              type: 'string',
              initialValue: '',
              fieldset: COL_FIELDSET_NAME['6-6'],
            }),
            defineField({
              title: 'End',
              name: 'end',
              type: 'string',
              initialValue: '',
              fieldset: COL_FIELDSET_NAME['6-6'],
            }),
            defineField({
              title: 'Body',
              name: 'body',
              type: 'text',
              initialValue: '',
              rows: 6,
            }),
          ],
          fieldsets: COL_FIELDSETS,
          components: {
            preview: SanityPreviewWithPublishedLabel,
          },
          preview: {
            select: {
              title: 'title',
              subtitle: 'employer',
              published: 'published',
            },
            prepare: ({ title, subtitle, published }) => ({
              title,
              subtitle,
              published,
              media: <Icon icon='mdi:briefcase' />,
            }),
          },
        }),
      ],
    }),
  ],
  fieldsets: COL_FIELDSETS,
});
