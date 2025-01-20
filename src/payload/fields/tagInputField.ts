import type { JSONField } from 'payload'

import deepMerge from '../utilities/deepMerge'

export const tagInputField: (overrides?: Partial<JSONField>) => JSONField = (overrides = {}) =>
  deepMerge<JSONField, Partial<JSONField>>(
    {
      name: 'tagInput',
      defaultValue: [],
      jsonSchema: {
        uri: 'a://b/foo.json', // required
        fileMatch: ['a://b/foo.json'], // required
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              label: { type: 'string' },
            },
          },
        },
      },
      type: 'json',
      admin: {
        components: {
          Field: '/payload/components/TagInputField',
        },
      },
    },
    overrides,
  )
