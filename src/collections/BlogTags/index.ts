import { AdminGroup } from '@custom-types'
import type { AccessArgs, CollectionConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { CollectionSlug } from '@/types/collections'
import type { BlogTag } from '@/types/payload'

import { revalidateBlogTag } from './hooks/revalidateBlogTag'

export const BlogTags: CollectionConfig = {
  slug: CollectionSlug.BlogTags,
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  defaultSort: [
    'highlighted',
    'title',
  ],
  disableDuplicate: true,
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Blog,
    groupBy: true,
    livePreview: {
      url: ({ data }) =>
        generatePreviewPath(CollectionSlug.BlogTags, data.slug),
    },
    preview: (data: Partial<BlogTag>) =>
      generatePreviewPath(CollectionSlug.BlogTags, data.slug),
    listSearchableFields: [
      'title',
      'slug',
    ],
    defaultColumns: [
      'title',
      'slug',
      'highlighted',
    ],
  },
  access: {
    create: authenticated,
    delete: async ({ req: { user, payload }, id }: AccessArgs<BlogTag>) => {
      if (!user) return false
      let references = 0

      try {
        const { totalDocs } = await payload.find({
          collection: CollectionSlug.BlogPosts,
          where: {
            tags: {
              contains: id,
            },
          },
          pagination: false,
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
  hooks: {
    afterChange: [
      revalidateBlogTag,
    ],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'heroImage',
    }),

    /* -------------- Sidebar Content -------------- */
    {
      name: 'heroImage',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
      admin: {
        position: 'sidebar',
        disableGroupBy: true,
        disableListColumn: true,
        disableListFilter: true,
      },
    },
    SlugField({
      fieldToUse: 'title',
    }),
    {
      name: 'highlighted',
      type: 'checkbox',
      defaultValue: false,
      label: 'Highlighted',
      admin: {
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
              editorVariant: 'caption',
              overrides: {
                label: false,
              },
            }),
          ],
        },
        {
          label: 'Related Posts',
          fields: [
            {
              name: 'relatedPosts',
              type: 'join',
              collection: CollectionSlug.BlogPosts,
              on: 'tags',
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
          fields: [
            MetaField(),
          ],
        },
      ],
    },
  ],
  orderable: true,
  trash: true,
}
