import { defineField, defineType } from 'sanity';
import { ImagePosition } from '../../components/ImagePosition';
import { Icon } from '@iconify/react';

export default defineType({
  title: 'Image',
  name: 'object.image',
  type: 'image',
  options: {
    hotspot: true,
    storeOriginalFilename: true,
    metadata: ['lqip', 'palette'],
  },
  icon: <Icon icon='clarity:image-line' />,
  fields: [
    defineField({
      title: 'Position',
      name: 'position',
      type: 'string',
      components: {
        input: ImagePosition,
      },
    }),
    defineField({
      title: 'Credits',
      name: 'credits',
      type: 'text',
      rows: 3,
    }),
  ],
});
