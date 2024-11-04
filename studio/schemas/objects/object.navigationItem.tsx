import { Icon } from '@iconify/react';
import { defineField, defineType } from 'sanity';
import { COL_FIELDSET_NAME, COL_FIELDSETS } from '../_shared';
import { NavigationItemVariant } from 'website/lib/types';

type PreviewProps = { title: string; variant: NavigationItemVariant };

export default defineType({
  title: 'Navigation Item',
  name: 'object.navigationItem',
  type: 'object',
  fields: [
    defineField({
      title: 'Label',
      name: 'label',
      type: 'string',
      initialValue: '',
    }),
    defineField({
      title: 'External URL',
      name: 'url',
      type: 'url',
      hidden: ({ parent }) => parent?.variant !== 'external',
    }),
    defineField({
      title: 'Internal Reference',
      name: 'ref',
      type: 'reference',
      initialValue: {},
      to: [
        { type: 'singleton.home' },
        { type: 'singleton.imprint' },
        { type: 'singleton.privacy' },
        { type: 'blog.post' },
        { type: 'blog.category' },
        { type: 'blog.tag' },
        { type: 'projects.project' },
        { type: 'projects.category' },
        { type: 'projects.tag' },
      ],
      hidden: ({ parent }) => parent?.variant !== 'internal',
      options: {
        disableNew: true,
      } as any, // TODO: fix later - current options typing requires filter config
    }),
    defineField({
      title: 'File Link',
      name: 'file',
      type: 'file',
      initialValue: {},
      hidden: ({ parent }) => parent?.variant !== 'file',
    }),
    defineField({
      title: 'Force Download',
      name: 'forceDownload',
      type: 'boolean',
      initialValue: false,
      fieldset: COL_FIELDSET_NAME['6-6'],
      hidden: ({ parent }) => parent?.variant === 'internal',
    }),
    defineField({
      title: 'Open in new Tab',
      name: 'blank',
      type: 'boolean',
      initialValue: false,
      fieldset: COL_FIELDSET_NAME['6-6'],
      hidden: ({ parent }) => parent?.variant === 'internal',
    }),
    defineField({
      title: 'Variant',
      name: 'variant',
      type: 'string',
      initialValue: 'internal',
      options: {
        layout: 'dropdown',
        list: [
          {
            title: 'External',
            value: 'external',
          },
          {
            title: 'Internal',
            value: 'internal',
          },
          {
            title: 'File',
            value: 'file',
          },
        ],
      },
      fieldset: COL_FIELDSET_NAME['6-6'],
    }),
    defineField({
      title: 'Mode / Layout',
      name: 'mode',
      type: 'string',
      initialValue: 'default',
      options: {
        layout: 'dropdown',
        list: [
          {
            title: 'Default',
            value: 'default',
          },
          {
            title: 'Primary',
            value: 'primary',
          },
          {
            title: 'Ghost',
            value: 'ghost',
          },
        ],
      },
      fieldset: COL_FIELDSET_NAME['6-6'],
    }),
    // defineField({
    //   title: 'Icon Left',
    //   name: 'iconLeft',
    //   type: 'string',
    //   initialValue: '',
    //   fieldset: COL_FIELDSET_NAME['6-6'],
    // }),
    // defineField({
    //   title: 'Icon Right',
    //   name: 'iconRight',
    //   type: 'string',
    //   initialValue: '',
    //   fieldset: COL_FIELDSET_NAME['6-6'],
    // }),
    // defineField({
    //   title: 'Icon Only',
    //   name: 'iconOnly',
    //   type: 'boolean',
    //   initialValue: false,
    //   fieldset: COL_FIELDSET_NAME['6-6'],
    // }),
    // defineField({
    //   title: 'Open in new Tab',
    //   name: 'blank',
    //   type: 'boolean',
    //   initialValue: false,
    //   options: {
    //     layout: 'checkbox',
    //   },
    // }),
    // defineField({
    //   title: 'Icon Only',
    //   name: 'iconOnly',
    //   type: 'boolean',
    //   initialValue: false,
    //   options: {
    //     layout: 'checkbox',
    //   },
    // }),
  ],
  fieldsets: COL_FIELDSETS,
  preview: {
    select: {
      title: 'label',
      variant: 'variant',
    },
    prepare({ title, variant }: PreviewProps) {
      const icon =
        variant === 'external'
          ? 'octicon:link-external-16'
          : variant === 'internal'
          ? 'octicon:link-16'
          : variant === 'file'
          ? 'carbon:zip-reference'
          : null;

      return {
        title,
        media: icon ? <Icon icon={icon} /> : null,
      };
    },
  },
});
