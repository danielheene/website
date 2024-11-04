import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';

export default defineType({
  title: 'Navigation Settings',
  name: 'settings.navigation',
  type: 'document',
  icon: () => <Icon icon='carbon:catalog' />,
  liveEdit: false,
  groups: [
    {
      title: 'Main Navigation',
      name: 'main',
      default: true,
    },
    {
      title: 'Footer Navigation',
      name: 'footer',
    },
    {
      title: 'Meta Navigation',
      name: 'meta',
    },
  ],
  fields: [
    defineField({
      title: 'Main Navigation',
      name: 'main',
      type: 'navigation',
      group: 'main',
    }),
    defineField({
      title: 'Footer Navigation',
      name: 'footer',
      type: 'navigation',
      group: 'footer',
    }),
    defineField({
      title: 'Meta Navigation',
      name: 'meta',
      type: 'navigation',
      group: 'meta',
    }),
  ],
  preview: {
    prepare: () => ({
      title: 'Navigation Settings',
    }),
  },
});
