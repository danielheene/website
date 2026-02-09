import { anyone } from '@/access/anyone'
import { revalidateBlogTag } from '@/collections/BlogTags/hooks/revalidateBlogTag'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { AdminGroup, CollectionSlug } from '@custom-types'
import { MetaDescriptionField, MetaImageField, MetaTitleField, OverviewField, PreviewField } from '@payloadcms/plugin-seo/fields'
import { CollectionConfig } from 'payload'

export const BlogTags: CollectionConfig = {
  slug: CollectionSlug.BlogTags,
  labels: {
    singular: 'Tag',
    plural: 'Tags',
  },
  defaultPopulate: { title: true, slug: true },
  disableDuplicate: true,
  admin: {
    useAsTitle: 'title',
    group: AdminGroup.Blog,
  },
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateBlogTag],
  },
  fields: [
    /* -------------- Main  Content -------------- */
    TitleField({ listViewThumbnailPath: 'heroImage' }),

    /* -------------- Sidebar Content -------------- */
    SlugField({ fieldToUse: 'title' }),

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
              relationTo: CollectionSlug.MediaImages,
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
}
