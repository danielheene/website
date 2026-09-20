import { CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { HeroSlidesField } from '@/fields/HeroSlides'
import { IconField } from '@/fields/Icon'
import { LinkGroupField } from '@/fields/LinkGroup'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import { BlogPostData } from '@/types/payload'

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
    components: {
      listMenuItems: [
        {
          path: '@/components/AdminPanel/SeedActions#SeedActions',
          clientProps: {
            collectionSlug: CollectionSlug.BlogPosts,
            collectionLabel: 'Posts',
          },
        },
      ],
    },
  },
  hooks: {
    beforeChange: [
      generateReadingTime,
    ],
    afterChange: [
      revalidateBlogPost,
    ],
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
      relationTo: [
        CollectionSlug.BlogTopics,
      ],
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
          editorVariant: 'sidebar',
        }),
      ],
    },

    {
      name: 'readingTime',
      type: 'number',
      label: 'Estimated Reading Time (min)',
      admin: {
        hidden: true,
        position: 'sidebar',
      },
    },

    /* -------------- Content -------------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
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
          label: 'Links',
          fields: [
            LinkGroupField(),
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
