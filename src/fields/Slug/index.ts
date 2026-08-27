import { deepMerge, type TextField } from 'payload'

import { generateSlugHook } from './hooks/generateSlug'

type SlugFieldOverrides = Partial<
  Omit<TextField, 'name' | 'type' | 'index' | 'unique' | 'label' | 'required' | 'hooks'>
>

type SlugFieldProps = {
  fieldToUse: string
  overrides?: SlugFieldOverrides
}

export const SlugField = ({ fieldToUse, overrides = {} }: SlugFieldProps): TextField => {
  return deepMerge<TextField, SlugFieldOverrides>(
    {
      name: 'slug',
      type: 'text',
      index: true,
      unique: true,
      label: 'Slug', // force label, as label is also used in list views
      required: true, // even when generated automatically, prevent nullable type
      hooks: {
        beforeValidate: [
          generateSlugHook(fieldToUse),
        ],
      },
      admin: {
        placeholder: 'Slug',
        position: 'sidebar',
        components: {
          Field: {
            path: '@/fields/Slug/components/FieldComponent',
            clientProps: {
              fieldToUse,
            },
          },
        },
      },
    },
    overrides,
  )
}
