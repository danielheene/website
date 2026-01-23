import { anyone } from '@/access/anyone'
import { TagList } from '@/fields/TagList'
import { revalidateMeta } from '@/payload/hooks/revalidateMeta'
import { AdminGroup, GlobalSlug } from '@custom-types'
import { GlobalConfig } from 'payload'

export const SettingsMeta: GlobalConfig = {
  slug: GlobalSlug.SettingsMeta,
  label: 'Meta',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateMeta],
  },
  admin: {
    group: AdminGroup.Settings,
  },
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
    },
    {
      name: 'fallbackDescription',
      type: 'textarea',
    },
    {
      name: 'fallbackImage',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: { contains: 'image' },
      },
    },
    TagList({
      name: 'keywords',
    }),
  ],
  versions: false,
}
