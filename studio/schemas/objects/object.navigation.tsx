import { defineArrayMember, defineField } from 'sanity';
import { defineType } from 'sanity';

export default defineType({
  title: 'Navigation',
  name: 'navigation',
  type: 'object',
  fields: [
    defineField({
      title: 'Label',
      name: 'label',
      type: 'string',
    }),
    // defineField({
    //   title: 'Identifier',
    //   name: 'id',
    //   type: 'slug',
    //   initialValue: {
    //     current: '',
    //   },
    //   options: {
    //     source: (doc) => doc.label as string,
    //     slugify: (input) => kebabCase(deburr(input as string)),
    //     maxLength: 96,
    //     isUnique: isUniqueAcrossAllDocuments,
    //   },
    // }),
    defineField({
      title: 'Entries',
      name: 'entries',
      type: 'array',
      initialValue: [],
      of: [
        defineArrayMember({
          type: 'object.navigationItem',
        }),
      ],
    }),
  ],
});
