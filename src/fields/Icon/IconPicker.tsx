'use client'

import { useEffect, useState } from 'react'
import { Button } from '@payloadcms/ui'

import { cn } from '@/lib/cn'

import {
  FAVORITE_COLLECTIONS,
  FAVORITE_GROUPS,
  findIconAlias,
  type IconAlias,
  resolveIconName,
} from './favorites'
import { IconGrid } from './IconGrid'
import { useIconCollection } from './useIconCollection'
import { MIN_QUERY_LENGTH, useIconSearch } from './useIconSearch'

/** Every alias, flattened in the order its group declares. */
const ALL_FAVORITES: IconAlias[] = FAVORITE_GROUPS.flatMap((group) => [
  ...group.aliases,
])

/** The favorites tab, plus one tab per favorite collection. */
const FAVORITES_TAB = 'favorites'

/** Category filter value meaning "every category in this collection". */
const ALL_CATEGORIES = ''

export interface IconPickerProps {
  value?: string
  onSelectAction: (icon: string) => void
  onClearAction?: () => void
  /**
   * Restrict Iconify search to one collection, e.g. `simple-icons`. When set,
   * the collection tabs are hidden — the field has already made that choice.
   */
  prefix?: string
  className?: string
}

/**
 * Searchable icon grid shared by the Payload field and the Lexical toolbar, so
 * both behave identically.
 *
 * Resting state is the favorites list (aliases, no prefix). The favorite
 * collections sit alongside it as tabs that list their icons without requiring
 * a search, and a query long enough to be meaningful searches all of Iconify.
 */
export const IconPicker = ({
  value,
  onSelectAction,
  onClearAction,
  prefix,
  className,
}: IconPickerProps) => {
  const [query, setQuery] = useState<string>('')
  const [tab, setTab] = useState<string>(FAVORITES_TAB)
  const [category, setCategory] = useState<string>(ALL_CATEGORIES)

  const trimmed = query.trim()
  const isSearching = trimmed.length >= MIN_QUERY_LENGTH

  // a field pinned to one collection has no tabs to offer
  const collectionTabs = prefix ? [] : FAVORITE_COLLECTIONS
  const activeCollection = collectionTabs.find((collection) => collection.prefix === tab)
  const showingFavorites = tab === FAVORITES_TAB && !activeCollection

  /** The collection being browsed: an active tab, or a field pinned by `prefix`. */
  const browsePrefix = activeCollection?.prefix ?? prefix

  const {
    icons: searchIcons,
    loading: searchLoading,
    error: searchError,
  } = useIconSearch({
    query,
    // browsing a collection tab scopes search to it; otherwise the field's own
    // prefix applies, if any
    prefix: browsePrefix,
    enabled: isSearching,
  })

  /**
   * A collection tab lists its icons straight away rather than making the user
   * search first, so the favorite collections are genuinely browsable.
   */
  const {
    icons: collectionIcons,
    categories,
    loading: collectionLoading,
    error: collectionError,
  } = useIconCollection({
    prefix: browsePrefix,
    enabled: !isSearching && Boolean(browsePrefix),
  })

  // a category from the previous collection has no meaning in this one
  // biome-ignore lint/correctness/useExhaustiveDependencies: reset is keyed on the collection, not the categories
  useEffect(() => {
    setCategory(ALL_CATEGORIES)
  }, [
    browsePrefix,
  ])

  /**
   * A stored `simple-icons:github` and the alias `github` are the same icon, so
   * compare on the resolved name to avoid showing neither as selected.
   */
  const selectedIconName = value ? resolveIconName(value) : undefined
  const isSelected = (candidate: string) =>
    Boolean(selectedIconName) && resolveIconName(candidate) === selectedIconName

  const loading = searchLoading || collectionLoading
  const error = searchError ?? collectionError

  /** The active category's icons, or the whole collection when unfiltered. */
  const browseIcons =
    category === ALL_CATEGORIES
      ? collectionIcons
      : (categories.find((entry) => entry.label === category)?.icons ?? collectionIcons)

  const results: string[] = (() => {
    // a query always searches Iconify, whichever tab is open
    if (isSearching) return searchIcons
    // at rest, favorites are local and collections list in full — the grid
    // windows itself, so a 15k set costs no more to show than a small one
    if (showingFavorites) return ALL_FAVORITES
    return browseIcons
  })()

  const emptyHint = (() => {
    if (loading || results.length > 0) return null
    if (isSearching) return 'No icons found.'
    return 'No icons available.'
  })()

  /** Switching tabs clears the query so results always match the visible tab. */
  const selectTab = (next: string) => {
    setTab(next)
    setQuery('')
  }

  const browseNotice =
    !isSearching && !loading && browsePrefix && results.length > 0
      ? `${results.length.toLocaleString()} icons`
      : null

  return (
    <div
      className={cn([
        'flex w-full flex-col gap-3',
        className,
      ])}
    >
      {collectionTabs.length > 0 && (
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Icon source">
          <TabButton
            active={showingFavorites}
            onClick={() => selectTab(FAVORITES_TAB)}
            label="Favorites"
          />
          {collectionTabs.map((collection) => (
            <TabButton
              key={collection.prefix}
              active={tab === collection.prefix}
              onClick={() => selectTab(collection.prefix)}
              label={collection.label}
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={activeCollection ? `Search ${activeCollection.label}…` : 'Search icons…'}
          aria-label="Search icons"
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        />
        {value && onClearAction && (
          <Button buttonStyle="secondary" margin={false} onClick={onClearAction}>
            Clear
          </Button>
        )}
      </div>

      {/*
       * Only two of the favorite sets declare categories (material-symbols: 17,
       * mdi: 61 plus an "Uncategorized" bucket); the rest are flat, so the
       * filter simply does not render for them.
       */}
      {!isSearching && categories.length > 0 && (
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label="Filter by category"
          className="w-full cursor-pointer rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value={ALL_CATEGORIES}>
            All categories ({collectionIcons.length.toLocaleString()})
          </option>
          {categories.map((entry) => (
            <option key={entry.label} value={entry.label}>
              {entry.label} ({entry.icons.length.toLocaleString()})
            </option>
          ))}
        </select>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {loading && <p className="text-sm text-muted-foreground">Searching…</p>}

      {emptyHint && <p className="text-sm text-muted-foreground">{emptyHint}</p>}

      {results.length > 0 && (
        <IconGrid
          icons={results}
          isSelected={isSelected}
          // in the favorites view the alias itself is stored; elsewhere the
          // full Iconify name is, unless an alias exists for it
          onSelectAction={(candidate) =>
            onSelectAction(showingFavorites ? candidate : (findIconAlias(candidate) ?? candidate))
          }
          describe={(candidate) => {
            const alias = showingFavorites ? candidate : findIconAlias(candidate)
            return alias && alias !== candidate ? `${alias} (${candidate})` : candidate
          }}
        />
      )}

      {browseNotice && <p className="text-sm text-muted-foreground">{browseNotice}</p>}

      {showingFavorites && !isSearching && (
        <p className="text-sm text-muted-foreground">
          Showing favorites — search or pick a collection for the full set.
        </p>
      )}
    </div>
  )
}

const TabButton = ({
  active,
  label,
  onClick,
}: {
  active: boolean
  label: string
  onClick: () => void
}) => (
  <button
    type="button"
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={cn([
      'cursor-pointer font-pp-supply-sans rounded-md border px-2 py-1 text-xs transition-colors',
      'focus-visible:ring-2 focus-visible:ring-ring',
      // active tab is marked by its border only, matching the grid's selection
      active
        ? 'border-primary text-foreground'
        : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground',
    ])}
  >
    {label}
  </button>
)
