import { AdminGroup } from '@custom-types'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { LinkField } from '@/fields/Link'
import { GlobalSlug } from '@/types/globals'

export const SettingsPageHeader: GlobalConfig<GlobalSlug.SettingsPageHeader> =
  {
    slug: GlobalSlug.SettingsPageHeader,
    label: 'Page Header',
    access: {
      read: authenticatedOrPublished,
      update: authenticated,
    },
    hooks: {
      afterChange: [
        async ({ context, doc }) => {
          if (context.skipRevalidate) return doc
          revalidateTag(GlobalSlug.SettingsPageHeader)
        },
      ],
    },
    admin: {
      group: AdminGroup.Settings,
    },
    typescript: {
      interface: 'PageHeaderData',
    },
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
                fields: [
                  LinkField(),
                ],
              },
            ],
          },
        ],
      },
    ],
    versions: false,
  }
