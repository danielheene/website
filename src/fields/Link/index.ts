import { ICON } from '@/components/Icon'
import { CollectionSlug } from '@custom-types'
import { startCase } from 'lodash-es'
import { deepMerge, Field, GroupField, OptionObject } from 'payload'

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

export const LinkField = ({ withAppearanceSelect = false, overrides = {} }: LinkFieldConfig = {}): GroupField =>
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
                {
                  label: 'E-Mail',
                  value: 'mailto',
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
            {
              name: 'icon',
              type: 'select',
              admin: {
                width: '25%',
              },
              options: [
                ...Object.entries(ICON).map(([iconLabel, iconName]) => ({
                  label: startCase(iconLabel),
                  value: iconName,
                })),
              ],
            },
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
                condition: (_, siblingData) => siblingData?.type === 'reference',
              },
              label: 'Document to link to',
              maxDepth: 1,
              relationTo: [CollectionSlug.Pages, CollectionSlug.BlogPosts, CollectionSlug.BlogCategories, CollectionSlug.BlogTags],
              required: true,
            },
            {
              name: 'url',
              type: 'text',
              admin: {
                width: '75%',
                condition: (_, siblingData) => siblingData?.type === 'custom',
              },
              label: 'Custom URL',
              required: true,
            },
            {
              name: 'address',
              type: 'email',
              admin: {
                width: '75%',
                condition: (_, siblingData) => siblingData?.type === 'mailto',
              },
              label: 'E-Mail Address',
              required: true,
            },
          ],
        },
        {
          type: 'row',
          admin: {
            condition: (_, siblingData) => siblingData?.type === 'mailto',
          },
          fields: [
            {
              name: 'subject',
              type: 'text',
              admin: {
                width: '50%',
              },
              label: 'Subject',
            },
            {
              name: 'cc',
              type: 'text',
              admin: {
                width: '50%',
              },
              label: 'CC',
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
