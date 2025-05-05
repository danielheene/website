import { anyone } from '@/payload/access/anyone'
import { tagInputField } from '@/payload/fields/tagInputField'
import { revalidateMeta } from '@/payload/schemas/Settings/hooks/revalidateMeta'
import { createGlobal } from '@/payload/utilities/schemaHelpers'

export const Meta = createGlobal({
  slug: 'settingsMeta',
  label: 'Meta',
  access: {
    read: anyone,
  },
  hooks: {
    afterChange: [revalidateMeta],
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
    },
    {
      name: 'titleTemplate',
      type: 'text',
      admin: {
        placeholder: '{{title}} | {{siteName}}',
      },
    },
    {
      name: 'fallbackTitle',
      type: 'text',
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
    tagInputField({ name: 'keywords' }),
  ],
  versions: false,
})
