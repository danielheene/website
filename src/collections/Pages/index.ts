import type { AccessArgs, CollectionConfig, FilterOptionsProps } from 'payload'

import { PAGE_BLOCK_SLUGS } from '@/blocks'
import { revalidatePage } from '@/collections/Pages/hooks/revalidatePage'
import {
  hideVersionsTabForSingleVersion,
  SINGLE_VERSION_DRAFTS,
} from '@/collections/shared/singleVersionDrafts'
import { GeneratorFlagsField } from '@/fields/GeneratorFlags'
import { HeroSlidesField } from '@/fields/HeroSlides'
import { LinkGroupField } from '@/fields/LinkGroup'
import { MetaField } from '@/fields/Meta'
import { ProtectedField } from '@/fields/Protected'
import { RichTextField } from '@/fields/RichText'
import { SectionGroupField } from '@/fields/SectionGroup'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { authenticated } from '@/lib/access/authenticated'
import { authenticatedOrPublished } from '@/lib/access/authenticatedOrPublished'
import { generatePreviewPath } from '@/lib/generatePreviewPath'
import { routeIndexHooks } from '@/lib/payloadHooks/routeIndexHooks'
import { AdminGroup } from '@/types/admin-panel'
import { BlockSlug } from '@/types/blocks'
import { CollectionSlug } from '@/types/collections'
import type { Page } from '@/types/payload'
import { PAGE_LAYOUT, PAGE_LAYOUT_LABEL } from '@/types/select-options'

import { getFilteredBlocks } from './utils/getFilteredBlocks'
import { LEGAL_BLOCK_SLUGS, validatePageContent } from './utils/legalBlocks'

const isRichTextLayout = (data: Partial<Page>) => data?.layout === PAGE_LAYOUT.RICH_TEXT

const isSectionsLayout = (data: Partial<Page>) => data?.layout === PAGE_LAYOUT.SECTIONS

const routeIndexHook = routeIndexHooks(CollectionSlug.Pages)

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
  defaultSort: ['title', 'slug'],
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
    pagination: {
      defaultLimit: 25,
      limits: [25, 50, 100],
    },
    defaultColumns: ['title', 'slug', 'status', 'updatedAt'],
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.Pages, data.slug),
    },
    preview: (data: Partial<Page>) => generatePreviewPath(CollectionSlug.Pages, data.slug),
    components: {
      listMenuItems:
        process.env.NODE_ENV !== 'production'
          ? [
              {
                path: '@/components/AdminPanel/SeedActions#SeedActions',
                clientProps: {
                  collectionSlug: CollectionSlug.Pages,
                  collectionLabel: 'Pages',
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
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({
      listViewThumbnailPath: 'hero.slides.0.media.value',
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
      defaultValue: PAGE_LAYOUT.RICH_TEXT,
      required: true,
      interfaceName: 'PageLayout',
      options: Object.values(PAGE_LAYOUT).map((layout) => ({
        label: PAGE_LAYOUT_LABEL[layout],
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
            SectionGroupField({
              label: 'Background',
              description:
                'The hero background strip. Add one or more slides, then reorder or replace them.',
              fields: [
                HeroSlidesField({
                  name: 'slides',
                }),
              ],
            }),
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
              modifyBlocks: (blocks) => [...blocks, BlockSlug.TwoColumnContent],
              overrides: {
                admin: {
                  condition: (_, siblingData) => siblingData?.contentType === 'custom',
                },
              },
            }),
            {
              type: 'row',
              admin: {
                condition: (_, siblingData) => siblingData?.contentType === 'custom',
              },
              fields: [],
            },
          ],
        },
        {
          label: 'Content',
          fields: [
            // Same name and editor as BlogPosts' `content`, so both render through
            // the shared article layout.
            RichTextField({
              name: 'content',
              editorVariant: 'post',
              modifyBlocks: (blocks) => [
                ...blocks,
                BlockSlug.TwoColumnContent,
                ...(LEGAL_BLOCK_SLUGS as typeof blocks),
              ],
              overrides: {
                label: false,
                validate: validatePageContent,
                admin: {
                  condition: (data) => isRichTextLayout(data),
                },
              },
            }),
            {
              name: 'sections',
              type: 'blocks',
              label: false,
              blocks: [],
              blockReferences: PAGE_BLOCK_SLUGS,
              minRows: 1,
              filterOptions: ({ data }: FilterOptionsProps<Page>) => getFilteredBlocks(data),
              admin: {
                condition: (data) => isSectionsLayout(data),
                disableListColumn: true,
                disableListFilter: true,
                disableGroupBy: true,
              },
            },
          ],
        },
        {
          label: 'Links',
          admin: {
            condition: (data) => isRichTextLayout(data),
          },
          fields: [LinkGroupField()],
        },
        {
          label: 'SEO',
          fields: [MetaField()],
        },
      ],
    },

    GeneratorFlagsField(),
  ],
  hooks: {
    afterChange: [revalidatePage, routeIndexHook.afterChange],
    afterDelete: [routeIndexHook.afterDelete],
  },
  trash: true,
  versions: SINGLE_VERSION_DRAFTS,
}
