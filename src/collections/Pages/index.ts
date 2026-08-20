import type { AccessArgs, CollectionConfig, FilterOptionsProps } from 'payload'

import { startCase } from 'lodash-es'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { BLOCK_SLUGS } from '@/blocks'
import { revalidatePage } from '@/collections/Pages/hooks/revalidatePage'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { MetaField } from '@/fields/Meta'
import { ProtectedField } from '@/fields/Protected'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { AdminGroup } from '@/types/admin-panel'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'
import { PAGE_LAYOUT } from '@/types/select-options'

import { getFilteredBlocks } from './utils/getFilteredBlocks'

export const Pages: CollectionConfig<CollectionSlug['Pages']> = {
  slug: CollectionSlug.Pages,
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  defaultPopulate: {
    title: true,
    slug: true,
  },
  defaultSort: [
    'title',
    'slug',
  ],
  disableDuplicate: true,
  access: {
    create: authenticated,
    delete: async ({ req: { user } }: AccessArgs<Page>) => {
      if (!user) return false
      return {
        protected: {
          not_equals: true,
        },
      }
    },
    read: authenticatedOrPublished,
    update: authenticated,
  },
  disableBulkEdit: true,
  admin: {
    group: AdminGroup.General,
    useAsTitle: 'title',
    defaultColumns: [
      'title',
      'slug',
      'status',
      'updatedAt',
    ],
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug['Pages'], data.slug),
    },
    preview: (data: Partial<Page>) => generatePreviewPath(CollectionSlug['Pages'], data.slug),
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'hero.media.0',
    }),

    /* -------------- Sidebar Content -------------- */
    ProtectedField(),

    SlugField({
      fieldToUse: 'title',
      overrides: {
        access: {
          update: ({ doc }) => {
            return !doc?.protected
          },
        },
      },
    }),

    {
      type: 'select',
      name: 'layout',
      access: {
        update: ({ doc }) => {
          return !doc?.protected
        },
      },
      defaultValue: 'default',
      interfaceName: 'PageLayout',
      options: Object.values(PAGE_LAYOUT).map((layout) => ({
        label: startCase(layout),
        value: layout,
      })),
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        disableListFilter: true,
        disableGroupBy: true,
      },
    },

    /* -------------- Tabs Content -------------- */
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          name: 'hero',
          fields: [
            {
              name: 'media',
              type: 'upload',
              relationTo: [
                CollectionSlug.MediaImages,
                CollectionSlug.MediaVideos,
              ],
              hasMany: true,
              displayPreview: true,
              label: false,
              admin: {
                description:
                  'Fills the first screen. Two or more entries become a cross-fading carousel; a single entry renders on its own.',
                disableListColumn: true,
                disableListFilter: true,
                disableGroupBy: true,
              },
            },
            {
              name: 'contentType',
              type: 'select',
              defaultValue: 'title',
              options: [
                {
                  label: 'Use Title as Hero Content',
                  value: 'title',
                },
                {
                  label: 'Use Custom Content',
                  value: 'custom',
                },
              ],
              admin: {
                disableListColumn: true,
                disableListFilter: true,
                disableGroupBy: true,
              },
            },
            RichTextField({
              name: 'content',
              editorVariant: 'post',
              overrides: {
                admin: {
                  condition: ({ hero }) => hero.contentType === 'custom',
                  disableListColumn: true,
                  disableListFilter: true,
                  disableGroupBy: true,
                },
              },
            }),
            {
              type: 'row',
              admin: {
                condition: ({ hero }) => hero.contentType === 'custom',
              },
              fields: [],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            {
              name: 'content',
              type: 'blocks',
              label: false,
              blocks: [],
              blockReferences: BLOCK_SLUGS,
              minRows: 1,
              filterOptions: ({ data }: FilterOptionsProps<Page>) => getFilteredBlocks(data),
              admin: {
                disableListColumn: true,
                disableListFilter: true,
                disableGroupBy: true,
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
  hooks: {
    afterChange: [
      revalidatePage,
    ],
  },
  trash: true,
  versions: {
    drafts: {
      autosave: false,
      schedulePublish: true,
    },
    maxPerDoc: 50,
  },
}
