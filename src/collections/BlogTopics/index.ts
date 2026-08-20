import type { AccessArgs, CollectionConfig } from 'payload'

import { anyone } from '@/access/anyone'
import { authenticated } from '@/access/authenticated'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { ToggleField } from '@/fields/Toggle'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { AdminGroup } from '@/types/admin-panel'
import { RESERVED_TOPIC_SLUGS } from '@/types/blog'
import { CollectionData, CollectionSlug } from '@/types/collections'

import { revalidateBlogTopic } from './hooks/revalidateBlogTopic'

export const BlogTopics: CollectionConfig<CollectionSlug['BlogTopics']> = {
  slug: CollectionSlug.BlogTopics,
  labels: {
    singular: 'Topic',
    plural: 'Topics',
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
      url: ({ data }) => generatePreviewPath(CollectionSlug.BlogTopics, data.slug),
    },
    preview: (data: Partial<CollectionData<CollectionSlug['BlogTopics']>>) =>
      generatePreviewPath(CollectionSlug.BlogTopics, data.slug),
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
    delete: async ({
      req: { user, payload },
      id,
    }: AccessArgs<CollectionData<CollectionSlug['BlogTopics']>>) => {
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
    // topics have no drafts/versions — authenticatedOrPublished would filter
    // on a nonexistent _status field and crash every access-enforced read
    // (including populating post.topics and the public REST API)
    read: anyone,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      revalidateBlogTopic,
    ],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    {
      type: 'row',
      fields: [
        TitleField({
          listViewThumbnailPath: 'heroImage',
        }),
        ToggleField({
          name: 'featured',
          iconActive: 'material-symbols:star',
          iconInactive: 'material-symbols:star-outline',
        }),
      ],
    },

    /* -------------- Sidebar Content -------------- */
    SlugField({
      fieldToUse: 'title',
      overrides: {
        validate: (value: string | null | undefined) => {
          // these segments belong to /blog/page/<n> and /blog/post/<slug>;
          // a topic using them would be permanently unreachable
          if (typeof value === 'string' && RESERVED_TOPIC_SLUGS.includes(value)) {
            return `"${value}" is reserved by the blog routes — choose another slug.`
          }
          return true
        },
      },
    }),

    {
      name: 'heroImage',
      type: 'upload',
      relationTo: [
        CollectionSlug.MediaImages,
      ],
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
              on: 'topics',
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

    GeneratorFlagsField(),
  ],
  orderable: true,
  trash: true,
}
