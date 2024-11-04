import { defineArrayMember, defineField, defineType } from 'sanity';

import { COL_FIELDSETS } from '../_shared';

// @ts-ignore
export default defineType({
  title: 'Logo Cloud',
  name: 'section.customers',
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
          name: 'object.customerItem',
          type: 'object.customerItem',
        }),
      ],
    }),
  ],
  fieldsets: COL_FIELDSETS,
});
