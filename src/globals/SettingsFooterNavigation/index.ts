import { AdminGroup, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import type { Field, GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { LinkField } from '@/fields/Link'

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
    fields: [LinkField()],
  },
]

export const SettingsFooterNavigation: GlobalConfig<GlobalSlug.SettingsFooterNavigation> = {
  slug: GlobalSlug.SettingsFooterNavigation,
  label: 'Footer Nav',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ context, doc }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsFooterNavigation)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: { interface: 'FooterNavigationData' },
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
              labels: { singular: 'Navigation Group', plural: 'Navigation Groups' },
              fields: navFields,
              maxRows: 3,
            },
          ],
        },
        {
          label: 'Social Links',
          name: 'socialLinks',
          fields: navFields,
        },
        {
          label: 'Legal Links',
          name: 'legalLinks',
          fields: navFields,
        },
      ],
    },
  ],
}
