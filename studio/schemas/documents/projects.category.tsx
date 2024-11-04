import { defineField, defineType } from 'sanity';

export default defineType({
  type: 'document',
  name: 'projects.category',
  title: 'Category',
  fields: [
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
    }),
    defineField({
      title: 'Poster',
      name: 'poster',
      type: 'image',
      options: {
        hotspot: true,
        storeOriginalFilename: true,
        metadata: ['lqip', 'palette'],
      },
    }),
    defineField({
      title: 'Body',
      name: 'body',
      type: 'block.content',
    }),
  ],
});
