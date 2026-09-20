import { type ArrayField, deepMerge } from 'payload'

import { cn } from 'tailwind-variants'
import { OmitDeep } from 'type-fest'

import { LinkField } from '@/fields/Link'

type LinkGroupFieldOverrides = Partial<
  OmitDeep<ArrayField, 'name' | 'type' | 'fields' | 'admin.className' | 'admin.components.RowLabel'>
>

interface LinkGroupFieldProps {
  overrides?: LinkGroupFieldOverrides
}

export const LinkGroupField = ({ overrides = {} }: LinkGroupFieldProps = {}): ArrayField =>
  deepMerge<ArrayField, LinkGroupFieldOverrides>(
    {
      type: 'array',
      name: 'links',
      labels: {
        singular: 'Link',
        plural: 'Links',
      },
      admin: {
        className: cn([
          String.raw`[&_.collapsible\_\_content]:pb-0`,
          String.raw`[&_.group-field\-\-within-collapsible]:pb-0`,
          String.raw`[&_.group-field\-\-within-collapsible]:border-none`,
        ]),
        components: {
          RowLabel: '@/fields/Link/components/RowLabel#LinkRowLabel',
        },
      },
      fields: [
        LinkField(),
      ],
    },
    overrides,
  )
