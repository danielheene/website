import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';
import { FieldConfig } from '../_shared';

export default defineType({
  title: 'Meta Settings',
  name: 'settings.meta',
  type: 'document',
  icon: () => <Icon icon='carbon:tag' />,
  liveEdit: false,
  fields: [
    defineField({
      title: 'Title Template',
      name: 'titleTemplate',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      title: 'Default Title',
      name: 'defaultTitle',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      ...FieldConfig.MetaDescription,
    }),
    defineField({
      ...FieldConfig.MetaKeywords,
    }),
    defineField({
      ...FieldConfig.MetaTags,
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Meta Settings',
    }),
  },
});
