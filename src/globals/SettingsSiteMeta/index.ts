import { authenticated } from '@/access/authenticated'
import { authenticatedOrPublished } from '@/access/authenticatedOrPublished'
import { TagList } from '@/fields/TagList'
import { AdminGroup, CollectionSlug, GlobalSlug } from '@custom-types'
import { revalidateTag } from 'next/cache'
import { GlobalConfig } from 'payload'

export const SettingsSiteMeta: GlobalConfig = {
  slug: GlobalSlug.SettingsSiteMeta,
  label: 'Site Meta',
  access: {
    read: authenticatedOrPublished,
    update: authenticated,
  },
  hooks: {
    afterChange: [
      async ({ doc, context }) => {
        if (context.skipRevalidate) return doc
        revalidateTag(GlobalSlug.SettingsSiteMeta)
      },
    ],
  },
  admin: {
    group: AdminGroup.Settings,
  },
  typescript: { interface: 'SiteMetaData' },
  fields: [
    {
      name: 'siteName',
      defaultValue: process.env.NEXT_PUBLIC_SERVER_HOST,
      type: 'text',
    },
    {
      name: 'titleTemplate',
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
        mimeType: { contains: 'image' },
      },
    },
    TagList({
      name: 'keywords',
    }),
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
