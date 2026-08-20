import { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { MediaField } from '@/fields/Media'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { BlogPostData } from '@/types/payload'

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
    read: anyone,
    update: authenticated,
  },
  admin: {
    group: AdminGroup.Blog,
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'slug',
      'updatedAt',
      'status',
    ],
    disableCopyToLocale: true,
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
    },
    preview: (data: Partial<BlogPostData>) =>
      generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
  },
  hooks: {
    afterChange: [
      revalidateBlogPost,
    ],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'heroImage',
    }),

    /* -------------- Sidebar Content -------------- */

    SlugField({
      fieldToUse: 'title',
    }),
    MediaField({
      name: 'heroImage',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
      position: 'sidebar',
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
      relationTo: [
        CollectionSlug.BlogTopics,
      ],
    },
    {
      name: 'relatedPosts',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      filterOptions: ({ id }) => {
        return {
          id: {
            not_in: [
              id,
            ],
          },
        }
      },
      hasMany: true,
      relationTo: [
        CollectionSlug.BlogPosts,
      ],
    },

    /* -------------- Content -------------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Main',
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
          label: 'SEO',
          fields: [
            MetaField(),
          ],
        },
      ],
    },

    GeneratorFlagsField(),
  ],
  trash: true,
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
