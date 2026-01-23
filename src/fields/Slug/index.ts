import { deepMerge, TextField } from 'payload'
import { generateSlugHook } from './hooks/generateSlug'

type SlugFieldOverrides = Partial<Omit<TextField, 'name' | 'type' | 'index' | 'unique' | 'label' | 'required' | 'hooks'>>

type SlugFieldProps = {
  fieldToUse: string
  overrides?: SlugFieldOverrides
}

export const SlugField = ({ fieldToUse, overrides = {} }: SlugFieldProps): TextField =>
  deepMerge<TextField, SlugFieldOverrides>(
    {
      name: 'slug',
      type: 'text',
      index: true,
      unique: true,
      label: 'Slug', // force label, as label is also used in list views
      required: false, // no need to require, as we auto-generate it when empty
      hooks: {
        beforeValidate: [generateSlugHook(fieldToUse)],
      },
      admin: {
        placeholder: 'Slug',
        position: 'sidebar',
        components: {
          Field: {
            path: '@/fields/Slug/FieldComponent',
            clientProps: {
              fieldToUse,
            },
          },
        },
      },
    },
    overrides,
  )
