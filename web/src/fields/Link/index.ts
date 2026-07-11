import { deepMerge, type Field, type GroupField, type OptionObject } from 'payload'

import { IconField } from '@/fields/Icon'
import { CollectionSlug } from '@/types/collections'
import type { LinkFieldData } from '@/types/payload'

export const appearanceOptions: Record<string, OptionObject> = {
  default: {
    label: 'Default',
    value: 'default',
  },

  outline: {
    label: 'Outline',
    value: 'outline',
  },
}

type LinkFieldOverrides = Partial<Omit<GroupField, 'name' | 'type' | 'fields'>>
type LinkFieldConfig = {
  withAppearanceSelect?: boolean
  overrides?: LinkFieldOverrides
}

export const LinkField = ({
  withAppearanceSelect = false,
  overrides = {},
}: LinkFieldConfig = {}): GroupField =>
  deepMerge<GroupField, LinkFieldOverrides>(
    {
      name: 'link',
      type: 'group',
      label: false,
      interfaceName: 'LinkFieldData',
      admin: {
        className: 'link-field',
        hideGutter: true,
      },
      fields: [
        {
          type: 'row',
          admin: {
            className: 'link-field__options',
          },
          fields: [
            {
              name: 'type',
              type: 'radio',
              label: false,
              admin: {
                layout: 'horizontal',
                className: 'link-field__type-option',
              },
              defaultValue: 'reference',
              options: [
                {
                  label: 'Internal link',
                  value: 'reference',
                },
                {
                  label: 'Custom URL',
                  value: 'custom',
                },
              ],
            },
            {
              name: 'newTab',
              type: 'checkbox',
              admin: {
                className: 'link-field__new-tab-option',
              },
              label: 'Open in new tab',
            },
          ],
        },
        {
          type: 'row',
          fields: [
            IconField({
              overrides: {
                admin: {
                  width: '25%',
                },
              },
            }),
            {
              name: 'label',
              type: 'text',
              admin: {
                width: '75%',
              },
              label: 'Label',
              required: true,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'iconOnly',
              type: 'checkbox',
              admin: {
                width: '25%',
              },
              label: 'Icon only',
            },
            {
              name: 'reference',
              type: 'relationship',
              admin: {
                width: '75%',
                condition: (_, siblingData: LinkFieldData) => siblingData?.type === 'reference',
              },
              label: 'Document to link to',
              maxDepth: 1,
              relationTo: [
                CollectionSlug['Pages'],
                CollectionSlug['BlogPosts'],
                CollectionSlug['BlogTags'],
              ],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                width: '75%',
                condition: (_, siblingData: LinkFieldData) => siblingData?.type === 'custom',
              },
              label: 'Custom URL',
              required: true,
            },
          ],
        },
        withAppearanceSelect
          ? {
              name: 'appearance',
              type: 'select',
              admin: {
                description: 'Choose how the link should be rendered.',
              },
              defaultValue: 'default',
              options: Object.values(appearanceOptions),
            }
          : false,
      ].filter(Boolean) as Field[],
    },
    overrides,
  )
