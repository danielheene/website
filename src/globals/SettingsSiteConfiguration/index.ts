import { AdminGroup } from '@custom-types'
import { revalidateTag } from 'next/cache'
import type { GlobalConfig } from 'payload'

import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { CollectionSlug } from '@/types/collections'
import { GlobalSlug } from '@/types/globals'

export const SettingsSiteConfiguration: GlobalConfig = {
  slug: GlobalSlug.SettingsSiteConfiguration,
  label: 'Site Meta',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsSiteConfiguration)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: {
    interface: 'SiteConfigurationData',
  },
  fields: [
    {
      name: 'siteName',
      label: 'Site Name',
      defaultValue: process.env.NEXT_PUBLIC_SERVER_HOST,
      type: 'text',
    },
    {
      name: 'titleTemplate',
      label: 'Title Template',
      type: 'text',
      defaultValue: '{{title}} | {{siteName}}',
      admin: {
        description:
          'This template is used for generating the title tag value on each page. ' +
          'Title refers to the actual document title which is suffixed with siteName.',
      },
    },
    {
      name: 'siteUrl',
      label: 'Site URL',
      type: 'text',
      defaultValue: process.env.NEXT_PUBLIC_SERVER_HOST,
      admin: {
        description: 'This URL is used for generating website metadata.',
        readOnly: true,
      },
    },
    {
      name: 'category',
      type: 'text',
      defaultValue: 'website',
      admin: {
        description: 'This category is used for generating website metadata.',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description:
          'This description is used for generating website metadata.' +
          'This description is also used as fallback if no document description is available.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: CollectionSlug.MediaImages,
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
    },
    {
      name: 'searchUrl',
      type: 'text',
      admin: {
        description: 'This URL is used for generating website metadata.',
      },
    },
  ],
  versions: false,
}
