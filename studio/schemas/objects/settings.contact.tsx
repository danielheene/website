import { defineField, defineType } from 'sanity';
import { COL_FIELDSETS } from '../_shared';
import { ContactInput } from '../../components';

export default defineType({
  title: 'Contact Services',
  name: 'settings.contact',
  type: 'object',
  components: {
    input: ContactInput,
  },
  fieldsets: COL_FIELDSETS,
  fields: [
    defineField({
      name: 'github',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'whatsapp',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'instagram',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'discord',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'mail',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'phone',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'linkedin',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      name: 'xing',
      type: 'string',
      initialValue: '',
    }),
  ],
});
