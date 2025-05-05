import { anyone } from '@/payload/access/anyone'
import { IntroTab, SLUG } from './_shared'
import { createGlobal } from '@/payload/utilities/schemaHelpers'
import { revalidateContact } from '@/payload/schemas/Resume/hooks/revalidateContact'

export const Contact = createGlobal({
  slug: SLUG.CONTACT,
  label: 'Contact',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateContact],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        IntroTab,
        {
          label: 'Buttons',
          fields: [
            {
              type: 'group',
              name: 'mailButton',
              admin: {
                className: 'contact-button',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  label: null,
                  admin: {
                    placeholder: 'Button Label',
                    className: 'contact-button__field',
                  },
                },
                {
                  name: 'href',
                  type: 'text',
                  label: null,
                  admin: {
                    placeholder: 'Link Href',
                    className: 'contact-button__field',
                  },
                },
              ],
            },
          ],
        },
      ],
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
