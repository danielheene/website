import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { LinkField } from '@/fields/Link'
import { AdminGroup, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

export const SettingsHeader: GlobalConfig<GlobalSlug.SettingsHeader> = {
  slug: GlobalSlug.SettingsHeader,
  label: 'Header',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async () => {
        revalidateTag(GlobalSlug.SettingsHeader)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: { interface: 'SettingsHeaderGlobalData' },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Navigation',
          fields: [
            {
              type: 'array',
              name: 'navigation',
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
