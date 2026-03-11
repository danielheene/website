import { AdminGroup, CollectionSlug } from '@custom-types'
import type { BlogCategory } from '@payload-types'
import { createBreadcrumbsField, createParentField } from '@payloadcms/plugin-nested-docs'
import type { AccessArgs, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'

import { generateBreadcrumbsPath } from './hooks/generateBreadcrumbsPath'
import { revalidateBlogCategory } from './hooks/revalidateBlogCategory'

export const BlogCategories: CollectionConfig<CollectionSlug.BlogCategories> = {
  slug: CollectionSlug.BlogCategories,
  labels: {
    singular: 'Category',
    plural: 'Categories',
  },
  defaultPopulate: { title: true, slug: true },
  defaultSort: ['title', 'slug'],
  disableDuplicate: true,
  access: {
    create: authenticated,
    delete: async ({ req: { user, payload }, id }: AccessArgs<BlogCategory>) => {
      if (!user) return false
      let references = 0

      try {
        const { totalDocs } = await payload.find({
          collection: CollectionSlug.BlogPosts,
          limit: 0,
          depth: 0,
          where: {
            categories: { contains: id },
          },
        })

        references += totalDocs
      } catch (_) {
        /* no references found */
      }

      try {
        const { totalDocs } = await payload.find({
          collection: CollectionSlug.BlogCategories,
          limit: 0,
          depth: 0,
          where: {
            parent: { equals: id },
          },
        })
        references += totalDocs
      } catch (_) {
        /* no references found */
      }

      return references === 0
    },
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: AdminGroup.Blog,
    useAsTitle: 'title',
    defaultColumns: ['title', 'breadcrumbsPath', 'slug'],
    disableCopyToLocale: true,
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.BlogCategories, data.slug),
    },
    preview: (data: Partial<BlogCategory>) => generatePreviewPath(CollectionSlug.BlogCategories, data.slug),
  },
  hooks: {
    afterChange: [revalidateBlogCategory],
    beforeChange: [generateBreadcrumbsPath],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({ listViewThumbnailPath: 'heroImage' }),

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
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    createParentField(CollectionSlug.BlogCategories, {
      admin: {
        position: 'sidebar',
        appearance: 'drawer',
        disableGroupBy: true,
        disableListColumn: false,
        disableListFilter: true,
      },
    }),

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
          label: 'Breadcrumbs',
          fields: [
            createBreadcrumbsField(CollectionSlug.BlogCategories, { label: false }),
            {
              name: 'breadcrumbsPath',
              type: 'text',
              admin: {
                hidden: true,
              },
              defaultValue: '',
            },
          ],
        },
        {
          label: 'Related Posts',
          fields: [
            {
              name: 'relatedPosts',
              type: 'join',
              collection: CollectionSlug.BlogPosts,
              on: 'categories',
              hasMany: true,
              label: false,
              admin: {
                allowCreate: false,
                disableGroupBy: true,
                disableListColumn: true,
                disableListFilter: true,
              },
            },
          ],
        },
        {
          label: 'SEO',
          fields: [MetaField()],
        },
      ],
    },
  ],
  trash: true,
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: false,
    },
    maxPerDoc: 50,
  },
}
