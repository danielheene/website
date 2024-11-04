import { defineArrayMember, defineField, defineType } from 'sanity';

export default defineType({
  title: 'Services',
  name: 'section.services',
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
          title: 'Service Feature',
          name: 'serviceItem',
          type: 'block.serviceItem',
        }),
      ],
    }),
  ],
});
