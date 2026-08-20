import type { GroupField } from 'payload'

import { MetaDescriptionField } from '@/fields/Meta/MetaDescriptionField'
import { MetaSerpField } from '@/fields/Meta/MetaSerpField'
import { MetaTitleField } from '@/fields/Meta/MetaTitleField'
import { SectionGroupField } from '@/fields/SectionGroup'

interface MetaFieldOptions {
  titlePath?: string
  slugPath?: string
}

export const MetaField = ({
  titlePath = 'title',
  slugPath = 'slug',
}: MetaFieldOptions = {}): GroupField =>
  SectionGroupField({
    name: 'meta',
    label: 'Meta Data',
    hideGutter: false,
    description: `
      This field group contains meta information for SEO purposes.
      It includes fields for title, description, and SERP optimization.
    `,
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
    overrides: {
      admin: {
        disableListColumn: true,
        disableBulkEdit: true,
        disableListFilter: true,
        disableGroupBy: true,
      },
    },
  })
