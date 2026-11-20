import { deepMerge, type GroupField, type TextFieldSingleValidation } from 'payload'

import { RichTextField } from '@/fields/RichText'

import { ATTRIBUTION_LICENSES } from './licenses'

export * from './licenses'

type AttributionFieldOverrides = Partial<Omit<GroupField, 'name' | 'type' | 'fields'>>

type AttributionFieldProps = {
  overrides?: AttributionFieldOverrides
}

// http(s) for profiles and sites, mailto for credits that only have an address
const validateCreditURL: TextFieldSingleValidation = (value) => {
  if (!value) return true

  try {
    const { protocol } = new URL(value)

    return ['http:', 'https:', 'mailto:'].includes(protocol) || 'Use an http(s) or mailto: link'
  } catch {
    return 'Enter a full URL, e.g. https://example.com'
  }
}

export const AttributionField = ({ overrides = {} }: AttributionFieldProps = {}): GroupField =>
  deepMerge<GroupField, AttributionFieldOverrides>(
    {
      name: 'attribution',
      type: 'group',
      label: 'Attribution / Credits',
      admin: {
        description: 'Shown on the legal page wherever this file is used on the site.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'authorName',
              type: 'text',
              label: 'Author Name',
            },
            {
              name: 'authorURL',
              type: 'text',
              label: 'Author URL',
              validate: validateCreditURL,
            },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'studioName',
              type: 'text',
              label: 'Studio / Platform Name',
            },
            {
              name: 'studioURL',
              type: 'text',
              label: 'Studio / Platform URL',
              validate: validateCreditURL,
            },
          ],
        },
        {
          name: 'license',
          type: 'select',
          label: 'License',
          options: Object.entries(ATTRIBUTION_LICENSES).map(([value, { label }]) => ({
            label,
            value,
          })),
        },
        RichTextField({
          name: 'notes',
          editorVariant: 'caption',
          overrides: {
            label: 'Notes',
          },
        }),
      ],
    },
    overrides,
  )
