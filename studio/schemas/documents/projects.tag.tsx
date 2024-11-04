import { defineField, defineType } from 'sanity';

export default defineType({
  type: 'document',
  name: 'projects.tag',
  title: 'Tag',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
    }),
  ],
});
