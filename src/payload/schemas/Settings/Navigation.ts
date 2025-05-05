import { link } from '../../fields/link'
import { revalidateNavigation } from './hooks/revalidateNavigation'
import { anyone } from '@/payload/access/anyone'
import { createGlobal } from '@/payload/utilities/schemaHelpers'

export const Navigation = createGlobal({
  slug: 'settingsNavigation',
  label: 'Navigation',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateNavigation],
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Header',
          description: 'This will appear within the tab above the fields.',
          fields: [
            {
              label: 'Header',
              name: 'headerNavItems',
              type: 'array',
              interfaceName: 'HeaderNavItems',
              admin: {
                components: {
                  Label: false,
                },
              },
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 6,
            },
          ],
        },
        {
          label: 'Footer',
          description: 'This will appear within the tab above the fields.',
          fields: [
            {
              label: false,
              name: 'footerNavItems',
              interfaceName: 'FooterNavItems',
              type: 'array',
              fields: [
                link({
                  appearances: false,
                }),
              ],
              maxRows: 6,
            },
          ],
        },
      ],
    },
  ],
  versions: false,
})
