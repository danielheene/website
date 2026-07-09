import type { AccessArgs, CollectionConfig, FilterOptionsProps } from 'payload'

import { AdminGroup } from '@custom-types'
import { isBoolean } from 'lodash-es'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { BLOCK_SLUGS } from '@/blocks'
import { revalidatePage } from '@/collections/Pages/hooks/revalidatePage'
import { MetaField } from '@/fields/Meta'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'

import { mapResumeValuesToBlocks } from './hooks/mapResumeValuesToBlocks'
import { removeInvalidBlockData } from './hooks/removeInvalidBlockData'
import { getFilteredBlocks } from './utils/getFilteredBlocks'

export const Pages: CollectionConfig<CollectionSlug['Pages']> = {
  slug: CollectionSlug['Pages'],
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
        slug: {
          not_in: [
            'home',
            'resume',
            'about-me',
            'legal-notice',
            'privacy-policy',
          ],
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
    SlugField({
      fieldToUse: 'title',
    }),

    {
      type: 'checkbox',
      name: 'protected',
      defaultValue: false,
      hooks: {
        beforeValidate: [
          ({ value }) => {
            return isBoolean(value) ? value : false
          },
        ],
      },
      access: {
        update: () => false,
        create: () => false,
      },
      admin: {
        position: 'sidebar',
        disableListColumn: true,
        disableListFilter: true,
        disableGroupBy: true,
      },
    },
    {
      type: 'select',
      name: 'layout',
      defaultValue: 'default',
      interfaceName: 'PageLayout',
      options: [
        {
          label: 'Default',
          value: 'default',
        },
        {
          label: 'Home',
          value: 'home',
        },
        {
          label: 'Resume',
          value: 'resume',
        },
      ],
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
                CollectionSlug['MediaImages'],
              ],
              hasMany: true,
              displayPreview: true,
              label: false,
              admin: {
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
              editorVariant: 'caption',
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
  ],
  hooks: {
    beforeRead: [
      mapResumeValuesToBlocks('content'),
    ],
    afterChange: [
      revalidatePage,
    ],
    beforeValidate: [
      removeInvalidBlockData('content'),
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
