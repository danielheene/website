import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { BLOCK_SLUGS } from '@/blocks'
import { revalidatePage } from '@/collections/Pages/hooks/revalidatePage'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { generatePreviewPath } from '@/payload/utilities/generatePreviewPath'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { Page } from '@payload-types'
import { AccessArgs, CollectionConfig, FilterOptionsProps } from 'payload'
import { mapResumeValuesToBlocks } from './hooks/mapResumeValuesToBlocks'
import { removeInvalidBlockData } from './hooks/removeInvalidBlockData'
import { getFilteredBlocks } from './utils/getFilteredBlocks'

export const Pages: CollectionConfig<CollectionSlug.Pages> = {
  slug: CollectionSlug.Pages,
  labels: {
    singular: 'Page',
    plural: 'Pages',
  },
  defaultPopulate: { title: true, slug: true },
  defaultSort: ['title', 'slug'],
  disableDuplicate: true,
  access: {
    create: authenticated,
    delete: async ({ req: { user } }: AccessArgs<Page>) => {
      if (!user) return false
      return {
        slug: {
          not_in: ['home', 'resume', 'about-me', 'legal-notice', 'privacy-policy'],
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
    defaultColumns: ['title', 'slug', 'updatedAt'],
    disableCopyToLocale: true,
    livePreview: {
      url: ({ data }) => generatePreviewPath(CollectionSlug.Pages, data.slug),
    },
    preview: (data: Partial<Page>) => generatePreviewPath(CollectionSlug.Pages, data.slug),
    components: {
      views: {
        edit: {
          resumePdf: {
            Component: '@/collections/Pages/components/ResumePdfView',
            path: '/pdf',
            tab: {
              Component: '@/collections/Pages/components/ResumePdfTab',
            },
          },
        },
      },
    },
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({ listViewThumbnailPath: 'hero.media.0' }),

    /* -------------- Sidebar Content -------------- */
    SlugField({ fieldToUse: 'title' }),

    {
      type: 'select',
      name: 'layout',
      defaultValue: 'default',
      interfaceName: 'PageLayout',
      options: [
        { label: 'Default', value: 'default' },
        { label: 'Home', value: 'home' },
        { label: 'Resume', value: 'resume' },
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
              relationTo: CollectionSlug.MediaImages,
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
                { label: 'Use Title as Hero Content', value: 'title' },
                { label: 'Use Custom Content', value: 'custom' },
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
        // {
        //   name: 'meta',
        //   label: 'SEO',
        //   fields: []
        //     OverviewField({
        //       titlePath: 'title',
        //       descriptionPath: 'content',
        //       imagePath: 'hero',
        //     }),
        //     MetaTitleField({
        //       // hasGenerateFn: true,
        //     }),
        //     MetaImageField({
        //       // hasGenerateFn: true,
        //       relationTo: 'media',
        //     }),
        //     MetaDescriptionField({}),
        //     PreviewField({
        //       // if the `generateUrl` function is configured
        //       // hasGenerateFn: true,
        //
        //       // field paths to match the target field for data
        //       titlePath: 'meta.title',
        //       descriptionPath: 'meta.description',
        //     }),
        //   ],
        // },
      ],
    },
  ],
  hooks: {
    beforeRead: [mapResumeValuesToBlocks('content')],
    afterChange: [revalidatePage],
    beforeValidate: [removeInvalidBlockData('content')],
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
