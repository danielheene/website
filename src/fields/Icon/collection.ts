/**
 * Shape of an Iconify `/collection` response and the normalisation applied to
 * it, shared by the cached route handler and the client hook that consumes it.
 *
 * Deliberately free of `'use client'` and of any React import: the route
 * handler runs on the server, so this module has to be importable from both
 * sides.
 */

/** One category of a collection, as offered by the picker's category filter. */
export interface IconCategory {
  label: string
  /** Fully-qualified icon names (`prefix:name`) filed under this category. */
  icons: string[]
}

/** A normalised collection: every icon, plus the categories the set declares. */
export interface IconCollection {
  icons: string[]
  categories: IconCategory[]
}

/**
 * Iconify's raw `/collection` response.
 *
 * Sets expose their icons either flat under `uncategorized` (simple-icons:
 * 3,446 flat, no categories) or grouped under `categories` (material-symbols:
 * 15,463 across 17 categories, `uncategorized` empty), so both have to be
 * merged to list a set completely.
 */
export interface CollectionResponse {
  uncategorized?: string[]
  categories?: Record<string, string[]>
}

/** Shared identity, so an empty result does not retrigger dependent effects. */
export const EMPTY_COLLECTION: IconCollection = {
  icons: [],
  categories: [],
}

/**
 * Narrow an untrusted `?prefix=` to one of the favorite collections.
 *
 * The prefix ends up in an upstream `fetch` URL, so passing it through unchecked
 * would make the route an open proxy to any Iconify collection — and its cache a
 * place anyone could fill by requesting arbitrary prefixes. Only the sets the
 * picker actually offers as tabs are proxied.
 */
export const isAllowedPrefix = (
  prefix: string | null,
  allowed: readonly {
    prefix: string
  }[],
): prefix is string => Boolean(prefix) && allowed.some((entry) => entry.prefix === prefix)

/**
 * Normalise one `/collection` response into a flat list plus its categories.
 *
 * Exported for tests: the shape varies enough between sets that the merge is
 * worth pinning down.
 */
export const parseCollection = (prefix: string, data: CollectionResponse): IconCollection => {
  const qualify = (name: string) => `${prefix}:${name}`

  const categories: IconCategory[] = Object.entries(data.categories ?? {})
    .map(([label, names]) => ({
      label,
      icons: names.map(qualify),
    }))
    .sort((a, b) => a.label.localeCompare(b.label))

  // `mdi` files 2,059 of its 7,447 icons outside every category, so a
  // category-only listing would silently hide them
  const loose = (data.uncategorized ?? []).map(qualify)
  if (categories.length > 0 && loose.length > 0) {
    categories.push({
      label: 'Uncategorized',
      icons: loose,
    })
  }

  // an icon may be filed under several categories (43 of Material Symbols'
  // 15,463 are), so dedupe or the grid repeats them under duplicate React keys
  const icons = [
    ...new Set([
      ...loose,
      ...categories.flatMap((category) => category.icons),
    ]),
  ]

  return {
    icons,
    categories,
  }
}
