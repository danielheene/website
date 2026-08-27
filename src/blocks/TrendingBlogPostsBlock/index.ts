import type { Block } from 'payload'

import { BlockGroup, BlockSlug } from '@/types/blocks'

export const TrendingBlogPostsBlock: Block = {
  slug: BlockSlug.TrendingBlogPosts,
  interfaceName: BlockSlug.TrendingBlogPosts,
  labels: {
    singular: 'Trending Blog Posts',
    plural: 'Trending Blog Posts',
  },
  admin: {
    group: BlockGroup.Blog,
    disableBlockName: true,
  },
  fields: [
    {
      type: 'group',
      name: 'heading',
      label: 'Heading',
      admin: {
        description: 'Optional heading shown above the trending blog posts.',
        hideGutter: true,
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'en',
              type: 'text',
              label: 'English',
              admin: {
                width: '50%',
              },
            },
            {
              name: 'de',
              type: 'text',
              label: 'German',
              admin: {
                width: '50%',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'postCount',
      type: 'number',
      label: 'Number of Posts',
      defaultValue: 4,
      min: 1,
      max: 10,
      admin: {
        description: 'How many trending blog posts to display in this block.',
      },
    },
  ],
}
