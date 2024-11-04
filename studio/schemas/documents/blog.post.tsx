import { defineArrayMember, defineField, defineType } from 'sanity';
import { FieldConfig } from '../_shared';

export default defineType({
  type: 'document',
  title: 'Post',
  name: 'blog.post',
  groups: [
    {
      title: 'Main',
      name: 'main',
    },
    {
      title: 'Meta',
      name: 'meta',
    },
  ],
  fields: [
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      group: 'main',
    }),
    defineField({
      title: 'Excerpt',
      name: 'excerpt',
      type: 'text',
      group: 'main',
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
    defineField({
      title: 'Tags',
      name: 'tags',
      type: 'array',
      initialValue: [],
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'blog.tag' }],
        }),
      ],
    }),
    defineField({
      title: 'Category',
      name: 'category',
      type: 'reference',
      to: [{ type: 'blog.category' }],
    }),
    defineField({ ...FieldConfig.SlugInput, group: 'meta' }),
    defineField({ ...FieldConfig.MetaDescription, group: 'meta' }),
    defineField({ ...FieldConfig.MetaKeywords, group: 'meta' }),
    defineField({ ...FieldConfig.MetaTags, group: 'meta' }),
  ],
});
