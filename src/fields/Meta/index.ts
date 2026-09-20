import type { Field, GroupField } from 'payload'

import { cn } from 'tailwind-variants'

import { MetaDescriptionField } from '@/fields/Meta/MetaDescriptionField'
import { MetaSerpField } from '@/fields/Meta/MetaSerpField'
import { MetaSerpProgressField } from '@/fields/Meta/MetaSerpProgressField'
import { MetaTitleField } from '@/fields/Meta/MetaTitleField'
import { SectionGroupField } from '@/fields/SectionGroup'

interface MetaFieldOptions {
  titlePath?: string
  slugPath?: string
}

// Google title: 1 line, ~600px column; 60 chars is the soft best-practice limit.
const TITLE_SERP_CONFIG = {
  charLimit: 60,
  lineWidth: 600,
  font: 'bold 20px Arial',
} as const

// Google description: 2 lines, ~600px column; 160 chars is the soft limit.
const DESCRIPTION_SERP_CONFIG = {
  charLimit: 160,
  lineWidth: 1200,
  font: '14px Arial',
} as const

const MetaSerpProgressGroupField = (fields: Field[]): GroupField => ({
  type: 'group',
  admin: {
    disableListColumn: true,
    disableBulkEdit: true,
    disableListFilter: true,
    disableGroupBy: true,
    hideGutter: true,
    className: cn([
      String.raw`[&>.group-field\_\_wrap>.render-fields>.field-type]:mb-2`,
      String.raw`[&>.group-field\_\_wrap>.render-fields>.serp-bar]:mb-4`,
    ]),
  },
  fields,
})

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
      MetaSerpProgressGroupField([
        MetaTitleField({
          titlePath,
        }),
        MetaSerpProgressField({
          watchPath: 'meta.title',
          serpConfig: TITLE_SERP_CONFIG,
          name: 'titleProgress',
        }),
      ]),
      MetaSerpProgressGroupField([
        MetaDescriptionField({
          slugPath,
        }),
        MetaSerpProgressField({
          watchPath: 'meta.description',
          serpConfig: DESCRIPTION_SERP_CONFIG,
          name: 'descriptionProgress',
        }),
      ]),
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
