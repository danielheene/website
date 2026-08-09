import { deepMerge, type TextField } from 'payload'

type IconPickerFieldOverrides = Partial<Omit<TextField, 'name' | 'type'>>

type IconPickerFieldProps = {
  name?: string
  /** Restrict search to one Iconify collection, e.g. `simple-icons`. */
  prefix?: string
  overrides?: IconPickerFieldOverrides
}

/**
 * Text field storing an Iconify icon name (`prefix:name`), edited through a
 * searchable picker backed by the self-hosted Iconify API.
 *
 * Unlike `@/fields/Icon` — a select limited to the curated `ICON` map — this
 * field can reach every icon Iconify serves, so use it where authors need a
 * free choice rather than a house set.
 */
export const IconPickerField = ({
  name = 'icon',
  prefix,
  overrides = {},
}: IconPickerFieldProps = {}): TextField =>
  deepMerge<TextField, IconPickerFieldOverrides>(
    {
      name,
      type: 'text',
      admin: {
        components: {
          Field: {
            path: '@/fields/IconPicker/components/FieldComponent',
            clientProps: {
              prefix,
            },
          },
        },
      },
    },
    overrides,
  )

export type { UseIconSearchOptions, UseIconSearchResult } from './useIconSearch'
export { ICONIFY_API, useIconSearch } from './useIconSearch'
