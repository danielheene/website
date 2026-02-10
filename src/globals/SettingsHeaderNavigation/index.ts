import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { LinkField } from '@/fields/Link'
import { AdminGroup, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

export const SettingsHeaderNavigation: GlobalConfig<GlobalSlug.SettingsHeaderNavigation> = {
  slug: GlobalSlug.SettingsHeaderNavigation,
  label: 'Header Navigation',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ context, doc }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsHeaderNavigation)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: { interface: 'HeaderNavigationData' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Main Navigation',
          fields: [
            {
              type: 'array',
              name: 'mainNavigation',
              labels: {
                singular: 'Navigation Item',
                plural: 'Navigation Items',
              },
              admin: {
                components: {
                  Label: false,
                },
              },
              fields: [LinkField()],
            },
          ],
        },
      ],
    },
  ],
}
