import { defineField, defineType } from 'sanity';
import { COL_FIELDSET_NAME, COL_FIELDSETS } from '../_shared';

export default defineType({
  title: 'Assets',
  description: 'global assets',
  name: 'settings.assets',
  type: 'object',
  fields: [
    defineField({
      title: 'Resume / CV',
      name: 'resume',
      type: 'file',
      initialValue: null,
      fieldset: COL_FIELDSET_NAME['6-6'],
    }),
    defineField({
      title: 'Public Signature / GPG Key',
      name: 'publicKey',
      type: 'file',
      initialValue: null,
      fieldset: COL_FIELDSET_NAME['6-6'],
    }),
  ],
  fieldsets: COL_FIELDSETS,
});
