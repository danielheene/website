import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';

export default defineType({
  title: 'Meta Tag',
  name: 'settings.metaTag',
  type: 'object',
  fields: [
    defineField({
      title: 'Type',
      name: 'type',
      type: 'string',
      initialValue: 'name',
      options: {
        layout: 'dropdown',
        list: [
          {
            title: 'name',
            value: 'name',
          },
          {
            title: 'property',
            value: 'property',
          },
          {
            title: 'httpEquiv',
            value: 'httpEquiv',
          },
        ],
      },
    }),
    defineField({
      title: 'Type Value',
      name: 'value',
      type: 'string',
      initialValue: '',
      hidden: ({ parent }) => parent.type === 'httpEquiv',
    }),
    defineField({
      title: 'Http-Equiv Attribute',
      name: 'attribute',
      type: 'string',
      options: {
        layout: 'dropdown',
        list: [
          {
            title: 'Content-Security-Policy',
            value: 'content-security-policy',
          },
          {
            title: 'Content-Type',
            value: 'content-type',
          },
          {
            title: 'Default-Style',
            value: 'default-style',
          },
          {
            title: 'Refresh',
            value: 'refresh',
          },
        ],
      },
      initialValue: 'content-security-policy',
      hidden: ({ parent }) => parent.type !== 'httpEquiv',
    }),
    defineField({
      title: 'Content Value',
      name: 'content',
      type: 'string',
      initialValue: '',
    }),
  ],
  preview: {
    select: {
      type: 'type',
      value: 'value',
      attribute: 'attribute',
      content: 'content',
    },
    prepare(props: {
      type: string;
      value: string;
      attribute: string;
      content: string;
    }) {
      const { type, value, attribute, content } = props;

      return {
        title: `<meta ${type}='${
          type === 'httpEquiv' ? attribute : value
        }' content='${content}' />`,
        media: <Icon icon='carbon:tag' />,
      };
    },
  },
});
