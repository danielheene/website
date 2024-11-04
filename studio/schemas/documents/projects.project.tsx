import { defineArrayMember, defineField, defineType } from 'sanity';
import { COL_FIELDSETS, FieldConfig } from '../_shared';
import { Icon } from '@iconify/react';

export default defineType({
  title: 'Project',
  name: 'projects.project',
  type: 'document',
  groups: [
    {
      title: 'Main',
      name: 'main',
      default: true,
    },
    {
      title: 'Body',
      name: 'body',
    },
    {
      title: 'Meta',
      name: 'meta',
    },
  ],
  fields: [
    defineField({
      title: 'Published',
      name: 'published',
      type: 'boolean',
      initialValue: true,
      group: 'main',
    }),
    defineField({
      title: 'Title',
      name: 'title',
      type: 'string',
      group: ['main', 'meta'],
    }),
    defineField({
      title: 'Sub-Title',
      name: 'subTitle',
      type: 'string',
      group: 'main',
    }),
    defineField({
      title: 'Links',
      name: 'links',
      type: 'array',
      of: [
        defineArrayMember({
          name: 'link',
          type: 'object',
          fields: [
            {
              title: 'Label',
              name: 'label',
              type: 'string',
            },
            {
              title: 'Icon',
              name: 'icon',
              type: 'string',
            },
            {
              title: 'URL',
              name: 'url',
              type: 'url',
            },
          ],
          preview: {
            select: {
              icon: 'icon',
              url: 'url',
            },
            prepare: ({ url, icon }) => ({
              title: url,
              media: <Icon icon={icon} />,
            }),
          },
        }),
      ],
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
      group: 'main',
    }),
    defineField({
      title: 'Excerpt',
      name: 'excerpt',
      type: 'text',
      rows: 3,
      group: 'main',
    }),
    defineField({
      title: 'Category',
      name: 'category',
      type: 'reference',
      to: [{ type: 'projects.category' }],
      group: 'main',
    }),
    defineField({
      title: 'Tags',
      name: 'tags',
      type: 'array',
      initialValue: [],
      of: [{ type: 'reference', to: [{ type: 'projects.tag' }] }],
      group: 'main',
    }),
    defineField({
      title: 'Body',
      name: 'body',
      type: 'block.content',
      group: 'body',
    }),
    defineField({ ...FieldConfig.SlugInput, group: 'meta' }),
    defineField({ ...FieldConfig.MetaDescription, group: 'meta' }),
    defineField({ ...FieldConfig.MetaKeywords, group: 'meta' }),
    defineField({ ...FieldConfig.MetaTags, group: 'meta' }),
  ],
  fieldsets: COL_FIELDSETS,
});
