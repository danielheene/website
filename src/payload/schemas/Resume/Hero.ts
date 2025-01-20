import { anyone } from '@/payload/access/anyone'
import { CaptionField, SLUG, TitleField } from './_shared'
import { createGlobal } from '@/payload/utilities/schemaHelpers'
import { revalidateHero } from '@/payload/schemas/Resume/hooks/revalidateHero'

export const Hero = createGlobal({
  slug: SLUG.HERO,
  label: 'Hero',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateHero],
  },
  fields: [
    {
      type: 'row',
      admin: {
        className: 'hero',
      },
      fields: [
        {
          name: 'background',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
          admin: {
            className: 'hero__image',
          },
        },
        {
          name: 'portrait',
          type: 'upload',
          relationTo: 'media',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
          admin: {
            className: 'hero__image',
          },
        },
      ],
    },
    {
      ...TitleField,
      type: 'textarea',
    },
    {
      ...CaptionField,
    },
  ],
})
