import { deepMerge, type GroupField, type OptionObject } from 'payload'

import { LinkField } from '@/fields/Link'

export const alignmentOptions: Record<string, OptionObject> = {
  left: {
    label: 'Left Aligned',
    value: 'left',
  },
  right: {
    label: 'Right Aligned',
    value: 'right',
  },
  center: {
    label: 'Centered',
    value: 'center',
  },
  list: {
    label: 'List',
    value: 'list',
  },
}

type LinkGroupFieldOverrides = Partial<Omit<GroupField, 'name' | 'type' | 'fields'>>

interface LinkGroupFieldProps {
  overrides?: LinkGroupFieldOverrides
}

export const LinkGroupField = ({ overrides = {} }: LinkGroupFieldProps = {}): GroupField =>
  deepMerge<GroupField, LinkGroupFieldOverrides>(
    {
      type: 'group',
      name: 'links',
      label: false,
      admin: {
        hideGutter: true,
      },
      fields: [
        {
          name: 'entries',
          type: 'array',
          label: false,
          labels: {
            singular: 'Link',
            plural: 'Links',
          },
          fields: [
            LinkField(),
          ],
        },
        {
          name: 'alignment',
          type: 'select',
          admin: {
            description: 'Choose how the links should be aligned.',
          },
          defaultValue: 'left',
          options: Object.values(alignmentOptions),
        },
      ],
    },
    overrides,
  )
