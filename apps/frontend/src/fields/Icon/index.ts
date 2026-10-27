import { deepMerge, type TextField } from 'payload'

type IconFieldOverrides = Partial<Omit<TextField, 'name' | 'type'>>

type IconFieldProps = {
  name?: string
  /** Restrict Iconify search to one collection, e.g. `simple-icons`. */
  prefix?: string
  /**
   * Render the field's label above the control. Off by default — the icon
   * square names itself through a tooltip, which is usually enough in the
   * narrow columns this field tends to sit in.
   */
  showLabel?: boolean
  /**
   * Render a free-text input (and a Browse button) beside the square, for
   * pasting an Iconify name directly. Off by default.
   */
  showInput?: boolean
  overrides?: IconFieldOverrides
}

/**
 * Icon field, edited through a searchable picker.
 *
 * Stores a plain string — either a curated key (`github`) or a full Iconify
 * name (`simple-icons:github`). `<Icon />` resolves the former through the
 * `ICON` map and passes the latter straight to Iconify, so both forms render
 * identically and content written by the previous select field keeps working
 * untouched.
 *
 * This replaces the earlier split between a curated `select` and a separate
 * free-text picker: one picker now covers both, with the house aliases as its
 * first tab and the favorite collections browsable alongside them.
 *
 * Renders as a bare icon square that opens the picker. `showLabel` and
 * `showInput` add the field label and the manual text entry back when a call
 * site wants the fuller control.
 */
export const IconField = ({
  name = 'icon',
  prefix,
  showLabel,
  showInput,
  overrides = {},
}: IconFieldProps = {}): TextField =>
  deepMerge<TextField, IconFieldOverrides>(
    {
      name,
      type: 'text',
      admin: {
        components: {
          Field: {
            path: '@/fields/Icon/Field',
            clientProps: {
              prefix,
              showLabel,
              showInput,
            },
          },
        },
      },
    },
    overrides,
  )

/*
 * Deliberately no value re-exports of the picker, the search hook or the
 * favorites here.
 *
 * This module is imported by the Payload config, so anything it pulls in is
 * loaded by `payload generate:types` under plain Node — where a transitive
 * `@payloadcms/ui` import fails on its bundler-only `.css` imports. Import
 * those from their own modules (`./IconPicker`, `./favorites`,
 * `./useIconSearch`) instead.
 */
