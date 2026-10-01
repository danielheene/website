import { CollectionConfig } from 'payload'

import {
  hideVersionsTabForSingleVersion,
  SINGLE_VERSION_DRAFTS,
} from '@/collections/shared/singleVersionDrafts'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { HeroSlidesField } from '@/fields/HeroSlides'
import { LinkGroupField } from '@/fields/LinkGroup'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { authenticated } from '@/lib/access/authenticated'
import { authenticatedOrPublished } from '@/lib/access/authenticatedOrPublished'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { BlogPostData } from '@/types/payload'

import { enqueueGenerateExcerpt } from './hooks/enqueueGenerateExcerpt'
import { generateReadingTime } from './hooks/generateReadingTime'
import { revalidateBlogPost } from './hooks/revalidateBlogPost'

export const BlogPosts: CollectionConfig<CollectionSlug['BlogPosts']> = {
  slug: CollectionSlug.BlogPosts,
  typescript: {
    interface: `BlogPostData`,
  },
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  disableDuplicate: true,
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: AdminGroup.Blog,
    useAsTitle: 'title',
    pagination: {
      defaultLimit: 25,
      limits: [25, 50, 100],
    },
    defaultColumns: ['title', 'slug', 'updatedAt', 'status'],
    disableCopyToLocale: true,
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
    },
    preview: (data: Partial<BlogPostData>) =>
      generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
    components: {
      listMenuItems:
        process.env.NODE_ENV !== 'production'
          ? [
              {
                path: '@/components/AdminPanel/SeedActions#SeedActions',
                clientProps: {
                  collectionSlug: CollectionSlug.BlogPosts,
                  collectionLabel: 'Posts',
                },
              },
            ]
          : [],
      views: {
        edit: {
          versions: {
            tab: {
              condition: hideVersionsTabForSingleVersion,
            },
          },
        },
      },
    },
  },
  hooks: {
    beforeChange: [generateReadingTime],
    afterChange: [revalidateBlogPost, enqueueGenerateExcerpt],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'hero.slides.0.media.value',
    }),

    /* -------------- Sidebar Content -------------- */

    SlugField({
      fieldToUse: 'title',
    }),
    {
      name: 'topics',
      type: 'relationship',
      admin: {
        position: 'sidebar',
        appearance: 'drawer',
        allowCreate: true,
        allowEdit: true,
      },
      hasMany: true,
      relationTo: [CollectionSlug.BlogTopics],
    },
    {
      name: 'hero',
      type: 'group',
      label: false,
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        disableListFilter: true,
        disableGroupBy: true,
      },
      fields: [
        HeroSlidesField({
          name: 'slides',
          editorVariant: 'single',
        }),
      ],
    },

    {
      type: 'row',
      admin: {
        position: 'sidebar',
      },
      fields: [
        {
          name: 'readingTime',
          type: 'number',
          label: 'Reading Time (min)',
          admin: {
            readOnly: true,
            width: '50%',
          },
        },
        {
          name: 'wordCount',
          type: 'number',
          label: 'Word Count',
          admin: {
            readOnly: true,
            width: '50%',
          },
        },
      ],
    },

    /* -------------- Content -------------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Article',
          fields: [
            RichTextField({
              name: 'content',
              editorVariant: 'post',
              overrides: {
                label: false,
              },
            }),
          ],
        },
        {
          label: 'Excerpt & Links',
          fields: [
            RichTextField({
              name: 'excerpt',
              editorVariant: 'excerpt',
              overrides: {
                label: 'Excerpt',
                admin: {
                  description:
                    'Shown on post listings. When a post is published without one, Claude writes it from the article.',
                },
              },
            }),
            LinkGroupField(),
          ],
        },
        {
          label: 'Search Preview',
          fields: [MetaField()],
        },
      ],
    },

    GeneratorFlagsField(),
  ],
  trash: true,
  versions: SINGLE_VERSION_DRAFTS,
}
