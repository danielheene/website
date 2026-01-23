import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/payload/utilities/generatePreviewPath'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { BlogPost } from '@payload-types'

import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from '@payloadcms/plugin-seo/fields'
import { CollectionConfig } from 'payload'
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
    TitleField({ listViewThumbnailPath: 'heroImage' }),

    /* -------------- Sidebar Content -------------- */
    SlugField({ fieldToUse: 'title' }),
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: 'media',
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

    /* -------------- Tabs Content -------------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Content',
          fields: [
            RichTextField({
              name: 'content',
              editorVariant: 'caption',
              overrides: {
                label: false,
              },
            }),
          ],
        },
        {
          name: 'meta',
          label: 'SEO',
          fields: [
            OverviewField({
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
              imagePath: 'meta.image',
            }),
            MetaTitleField({
              hasGenerateFn: true,
            }),
            MetaImageField({
              hasGenerateFn: true,
              relationTo: 'media',
            }),
            MetaDescriptionField({}),
            PreviewField({
              hasGenerateFn: true,
              titlePath: 'meta.title',
              descriptionPath: 'meta.description',
            }),
          ],
        },
      ],
    },
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
