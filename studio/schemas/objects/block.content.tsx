import { Icon } from '@iconify/react';
import { defineType } from 'sanity';

export default defineType({
  title: 'Block Content',
  name: 'block.content',
  type: 'array',
  of: [
    {
      title: 'Block',
      type: 'block',
      styles: [
        { title: 'Normal', value: 'normal' },
        { title: 'H2', value: 'h2' },
        { title: 'H3', value: 'h3' },
        { title: 'H4', value: 'h4' },
        { title: 'Quote', value: 'blockquote' },
      ],
      // lists: [{ title: 'Bullet', value: 'bullet' }],
      marks: {
        // Decorators usually describe a single property – e.g. a typographic
        // preference or highlighting by editors.
        decorators: [
          { title: 'Strong', value: 'strong' },
          { title: 'Emphasis', value: 'em' },
          { title: 'Code', value: 'code' },
        ],
        // Annotations can be any object structure – e.g. a link or a footnote.
        annotations: [
          // { type: 'externalLink', icon: ExternalLinkIcon },
          // { type: 'internalLink', icon: LinkIcon },
        ],
      },
    },
    {
      type: 'object.image',
      icon: <Icon icon='clarity:image-line' />,
    },
    {
      type: 'object.images',
      icon: <Icon icon='clarity:image-gallery-line' />,
    },
    {
      type: 'object.code',
      icon: <Icon icon='ci:code' />,
    },
  ],
});
