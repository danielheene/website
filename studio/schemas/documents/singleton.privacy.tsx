import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';
import { FieldConfig } from '../_shared';

export default defineType({
  title: 'Privacy',
  name: 'singleton.privacy',
  type: 'document',
  icon: () => <Icon icon='ic:outline-privacy-tip' />,
  groups: [
    {
      title: 'Main',
      name: 'main',
      default: true,
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
      group: ['main', 'meta'],
    }),
    defineField({
      title: 'Body',
      name: 'body',
      type: 'block.content',
      group: ['main'],
    }),
    defineField({ ...FieldConfig.SlugInput, group: 'meta' }),
    defineField({ ...FieldConfig.MetaDescription, group: 'meta' }),
    defineField({ ...FieldConfig.MetaKeywords, group: 'meta' }),
    defineField({ ...FieldConfig.MetaTags, group: 'meta' }),
  ],
  preview: {
    prepare: () => ({
      title: 'Privacy',
    }),
  },
});
