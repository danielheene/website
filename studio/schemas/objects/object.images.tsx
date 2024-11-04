import { defineArrayMember, defineType } from 'sanity';
import { Icon } from '@iconify/react';

export default defineType({
  title: 'Images',
  name: 'object.images',
  type: 'object',
  icon: <Icon icon='clarity:image-gallery-line' />,
  fields: [
    {
      name: 'entries',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'object.image',
        }),
      ],
    },
  ],
});
