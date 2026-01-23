import { deepMerge, JSONField } from 'payload'

type JSONFieldOverrides = Partial<Omit<JSONField, 'name' | 'defaultValue' | 'jsonSchema' | 'type'>>

type TagListFieldProps = {
  name: string
  overrides?: JSONFieldOverrides
}

export const TagList = ({ name, overrides = {} }: TagListFieldProps): JSONField =>
  deepMerge<JSONField, JSONFieldOverrides>(
    {
      name,
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
          Field: '@/fields/TagList/TagListComponent',
        },
      },
    },
    overrides,
  )
