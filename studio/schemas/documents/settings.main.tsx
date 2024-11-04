import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';

import { COL_FIELDSETS } from '../_shared';

export default defineType({
  title: 'Settings Main',
  name: 'settings.main',
  type: 'document',
  icon: () => <Icon icon='carbon:settings' />,
  liveEdit: false,
  fields: [
    defineField({
      title: 'Features',
      name: 'features',
      type: 'settings.features',
    }),
    defineField({
      title: 'Contact',
      name: 'contact',
      type: 'settings.contact',
    }),
    defineField({
      title: 'Features',
      name: 'assets',
      type: 'settings.assets',
    }),
  ],
  fieldsets: COL_FIELDSETS,
  preview: {
    prepare: () => ({
      title: 'Main Settings',
    }),
  },
});
