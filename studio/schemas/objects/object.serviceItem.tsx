import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';
import { SanityPreviewWithPublishedLabel } from '../../components';

type PreviewProps = {
  title: string;
  icon: string;
  subtitle: string;
  published: boolean;
};

export default defineType({
  title: 'Service Item',
  name: 'block.serviceItem',
  type: 'object',
  fields: [
    defineField({
      title: 'Published',
      name: 'published',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      title: 'Name',
      name: 'name',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      title: 'Icon',
      name: 'icon',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      title: 'Body',
      name: 'body',
      type: 'block.content',
    }),
  ],
  // components: {
  //   preview: SanityPreviewWithPublishedLabel,
  // },
  preview: {
    select: {
      title: 'name',
      icon: 'icon',
      subtitle: 'employer',
      published: 'published',
    },
    prepare: ({ title, icon, subtitle, published }: PreviewProps) => ({
      title,
      subtitle,
      published,
      media: <Icon icon={icon} />,
    }),
  },
});
