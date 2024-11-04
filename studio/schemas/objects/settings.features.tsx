import { defineField, defineType } from 'sanity';
import { COL_FIELDSETS } from '../_shared';

export default defineType({
  title: 'Feature Toggles',
  description: 'Enable / Disable Features',
  name: 'settings.features',
  type: 'object',
  fields: [
    defineField({
      title: 'Widget: Hire Me',
      description: 'Should the "Hire Me" widget be rendered?',
      name: 'hireMeWidget',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      title: 'Easter Egg',
      description: 'Should the "Toasty" easter egg be rendered?',
      name: 'easterEggWidget',
      type: 'boolean',
      initialValue: true,
    }),
  ],
  fieldsets: COL_FIELDSETS,
});
