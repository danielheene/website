import { defineField, defineType } from 'sanity';
import { SanityPreviewWithPublishedLabel } from '../../components';
import byteSize from 'byte-size';

type PreviewProps = {
  name: string;
  imageUrl: string;
  published: boolean;
  dimensions: { width: number; height: number };
  fileSize: number;
};

export default defineType({
  title: 'Customer Item',
  name: 'object.customerItem',
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
      title: 'Logo',
      name: 'image',
      type: 'image',
      options: {
        hotspot: true,
        storeOriginalFilename: true,
        metadata: ['lqip', 'palette'],
      },
    }),
  ],
  // components: {
  //   preview: SanityPreviewWithPublishedLabel,
  // },
  preview: {
    select: {
      name: 'name',
      imageUrl: 'image.asset.url',
      dimensions: 'image.asset.metadata.dimensions',
      fileSize: 'image.asset.size',
      published: 'published',
    },
    prepare({
      name,
      imageUrl,
      published,
      dimensions: { width, height },
      fileSize,
    }: PreviewProps) {
      let subtitle = [];
      if (!!width && !!height) subtitle.push(`${width}x${height}`);
      if (!!fileSize) subtitle.push(byteSize(fileSize as number));

      return {
        title: name,
        subtitle: subtitle.join(' • '),
        media: <img src={imageUrl} style={{ background: 'white' }} alt='' />,
        published,
      };
    },
  },
});
