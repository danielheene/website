import { AdminGroup } from '@custom-types'
import { revalidateTag } from 'next/cache'
import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { LinkField } from '@/fields/Link'
import { GlobalSlug } from '@/types/globals'

const navFields: Field[] = [
  {
    type: 'text',
    name: 'title',
  },
  {
    type: 'array',
    name: 'entries',
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
]

export const SettingsPageFooter: GlobalConfig<GlobalSlug.SettingsPageFooter> =
  {
    slug: GlobalSlug.SettingsPageFooter,
    label: 'Page Footer',
    access: {
      read: authenticatedOrPublished,
      update: authenticated,
    },
    hooks: {
      afterChange: [
        async ({ context, doc }) => {
          if (context.skipRevalidate) return doc
          revalidateTag(GlobalSlug.SettingsPageFooter)
        },
      ],
    },
    admin: {
      group: AdminGroup.Settings,
    },
    typescript: {
      interface: 'PageFooterData',
    },
    fields: [
      {
        type: 'tabs',
        tabs: [
          {
            label: 'Navigation Groups',
            fields: [
              {
                type: 'array',
                name: 'navGroups',
                labels: {
                  singular: 'Navigation Group',
                  plural: 'Navigation Groups',
                },
                fields: navFields,
                maxRows: 3,
              },
            ],
          },
          {
            label: 'Legal Links',
            name: 'legalLinks',
            fields: navFields,
          },
        ],
      },
    ],
    versions: false,
  }
