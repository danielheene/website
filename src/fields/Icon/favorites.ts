import { BRAND_ICON, ICON, UI_ICON } from '@/components/Icon'

/**
 * Iconify collections surfaced as browsable tabs in the picker.
 *
 * These are the sets worth reaching for in this project; everything else stays
 * available through free search, so this list narrows the *default* choice
 * without limiting it. Ordered as they should appear.
 */
export const FAVORITE_COLLECTIONS = [
  {
    prefix: 'material-symbols',
    label: 'Material Symbols',
  },
  {
    prefix: 'mdi',
    label: 'Material Design Icons',
  },
  {
    prefix: 'radix-icons',
    label: 'Radix Icons',
  },
  {
    prefix: 'carbon',
    label: 'Carbon',
  },
  {
    prefix: 'simple-icons',
    label: 'Simple Icons',
  },
  {
    prefix: 'devicon-plain',
    label: 'Devicon Plain',
  },
  {
    prefix: 'fad',
    label: 'Font Audio',
  },
] as const satisfies readonly {
  prefix: string
  label: string
}[]

export type FavoriteCollection = (typeof FAVORITE_COLLECTIONS)[number]
export type FavoriteCollectionPrefix = FavoriteCollection['prefix']

/**
 * Short aliases for icons used often enough to deserve a prefix-free name.
 *
 * This is the `ICON` map — `BRAND_ICON` plus `UI_ICON` — reused as the alias
 * table rather than a second list to keep in sync: every curated key already
 * *is* an alias to a real Iconify name (`github` → `simple-icons:github`).
 * Add project-specific aliases to `BRAND_ICON`/`UI_ICON` and they appear here.
 */
export const ICON_ALIASES = ICON

export type IconAlias = keyof typeof ICON_ALIASES

/** Alias keys grouped for the picker's favorites view. */
export const FAVORITE_GROUPS = [
  {
    key: 'brand',
    label: 'Brands',
    aliases: Object.keys(BRAND_ICON) as IconAlias[],
  },
  {
    key: 'ui',
    label: 'Interface',
    aliases: Object.keys(UI_ICON) as IconAlias[],
  },
] as const satisfies readonly {
  key: string
  label: string
  aliases: readonly IconAlias[]
}[]

/** True when `value` is a curated alias rather than a raw `prefix:name`. */
export const isIconAlias = (value: string): value is IconAlias => value in ICON_ALIASES

/**
 * Resolve a stored value to the Iconify name Iconify itself understands.
 *
 * Mirrors what `<Icon />` does at render time, exposed separately so the picker
 * can show the underlying name and search can match on either form.
 */
export const resolveIconName = (value: string): string =>
  isIconAlias(value) ? ICON_ALIASES[value] : value

/**
 * Reverse lookup: the alias for a full Iconify name, if one exists.
 *
 * Lets the picker show `github` as selected when the stored value is the
 * equivalent `simple-icons:github`, so the two forms do not look like
 * different icons.
 */
const ALIAS_BY_ICON_NAME = new Map<string, IconAlias>(
  (
    Object.entries(ICON_ALIASES) as [
      IconAlias,
      string,
    ][]
  ).map(([alias, iconName]) => [
    iconName,
    alias,
  ]),
)

export const findIconAlias = (iconName: string): IconAlias | undefined =>
  ALIAS_BY_ICON_NAME.get(iconName)

/**
 * Human-readable name for a stored value or a picker candidate.
 *
 * Shows the alias with the Iconify name it resolves to when the two differ
 * (`github (simple-icons:github)`), so a tooltip explains what a bare alias
 * actually points at without the reader having to know the map.
 */
export const describeIcon = (value: string): string => {
  const alias = isIconAlias(value) ? value : findIconAlias(value)
  if (!alias) return value

  const resolved = resolveIconName(alias)
  return resolved === alias ? alias : `${alias} (${resolved})`
}
