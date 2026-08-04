import type { GroupField } from 'payload'

import dedent from 'dedent'

import { MetaDescriptionField } from '@/fields/Meta/MetaDescriptionField'
import { MetaSerpField } from '@/fields/Meta/MetaSerpField'
import { MetaTitleField } from '@/fields/Meta/MetaTitleField'

interface MetaFieldOptions {
  titlePath?: string
  slugPath?: string
}

export const MetaField = ({
  titlePath = 'title',
  slugPath = 'slug',
}: MetaFieldOptions = {}): GroupField => ({
  name: 'meta',
  type: 'group',
  label: 'Meta Data',
  admin: {
    disableListColumn: true,
    disableBulkEdit: true,
    disableListFilter: true,
    disableGroupBy: true,
    description: dedent`
      This field group contains meta information for SEO purposes.
      It includes fields for title, description, and SERP optimization.
    `,
    components: {
      Description: '@/components/AdminPanel#MarkdownDescription',
    },
  },
  fields: [
    MetaSerpField({
      slugPath,
    }),
    MetaTitleField({
      titlePath,
    }),
    MetaDescriptionField({
      slugPath,
    }),
  ],
})
