import { anyone } from '@/payload/access/anyone'
import { CaptionField, SLUG, TitleField } from './_shared'
import { revalidateAboutMe } from './hooks/revalidateAboutMe'
import { createGlobal } from '@/payload/utilities/schemaHelpers'

export const AboutMe = createGlobal({
  slug: SLUG.ABOUT_ME,
  label: 'About Me',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateAboutMe],
  },
  fields: [
    {
      type: 'row',
      admin: {
        className: 'about-me',
      },
      fields: [
        {
          name: 'portrait',
          type: 'upload',
          label: false,
          relationTo: 'media',
          filterOptions: {
            mimeType: { contains: 'image' },
          },
          admin: {
            className: 'about-me__image',
          },
        },
      ],
    },
    {
      ...TitleField,
    },
    {
      ...CaptionField,
      name: 'content',
    },
    {
      name: 'anchor',
      label: 'Scroll Anchor',
      type: 'text',
      admin: {
        position: 'sidebar',
      },
    },
  ],
})
