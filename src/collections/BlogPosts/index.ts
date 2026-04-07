import { AdminGroup, CollectionSlug } from '@custom-types'
import type { BlogPost } from '@payload-types'
import type { CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'

import { revalidateBlogPost } from './hooks/revalidateBlogPost'

export const BlogPosts: CollectionConfig<CollectionSlug.BlogPosts> = {
  slug: CollectionSlug.BlogPosts,
  labels: {
    singular: 'Post',
    plural: 'Posts',
  },
  defaultPopulate: { title: true, slug: true },
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
    defaultColumns: ['title', 'slug', 'updatedAt', 'status'],
    disableCopyToLocale: true,
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
    },
    preview: (data: Partial<BlogPost>) => generatePreviewPath(CollectionSlug.BlogPosts, data.slug),
  },
  hooks: {
    afterChange: [revalidateBlogPost],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'heroImage',
    }),

    /* -------------- Sidebar Content -------------- */
    SlugField({ fieldToUse: 'title' }),
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
      filterOptions: {
        mimeType: { contains: 'image' },
      },
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'categories',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: false,
      relationTo: CollectionSlug.BlogCategories,
    },
    {
      name: 'tags',
      type: 'relationship',
      admin: {
        position: 'sidebar',
      },
      hasMany: true,
      relationTo: CollectionSlug.BlogTags,
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
            not_in: [id],
          },
        }
      },
      hasMany: true,
      relationTo: CollectionSlug.BlogPosts,
    },

    /* -------------- Content -------------- */
    RichTextField({
      name: 'content',
      editorVariant: 'post',
      overrides: {
        label: false,
      },
    }),
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
