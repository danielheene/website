import { anyone } from '@/access/anyone'
import { revalidateBlogTag } from '@/collections/BlogTags/hooks/revalidateBlogTag'
import { RichTextField } from '@/fields/RichText'
import { SlugField } from '@/fields/Slug'
import { TitleField } from '@/fields/Title'
import { AdminGroup, CollectionSlug } from '@custom-types'
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
    disableCopyToLocale: true,
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

    /* -------------- Content -------------- */
    RichTextField({
      name: 'content',
      editorVariant: 'caption',
      overrides: {
        label: false,
      },
    }),
  ],
  trash: true,
}
