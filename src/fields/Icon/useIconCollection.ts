'use client'

import { useEffect, useState } from 'react'

import { EMPTY_COLLECTION, type IconCategory, type IconCollection } from './collection'

export interface UseIconCollectionOptions {
  /** Iconify collection prefix, e.g. `simple-icons`. */
  prefix?: string
  /** Skip fetching (e.g. while another tab is active). */
  enabled?: boolean
}

export interface UseIconCollectionResult {
  /** Every icon in the collection, fully-qualified (`prefix:name`). */
  icons: string[]
  /**
   * Categories the set declares, empty for flat sets.
   *
   * Sets differ: `material-symbols` files all 15,463 icons across 17 categories
   * with nothing uncategorized, `mdi` splits 7,447 over 61 categories plus
   * 2,059 loose, and `carbon`/`simple-icons`/`radix-icons`/`fad` declare none at
   * all. The picker shows the filter only when this is non-empty.
   */
  categories: IconCategory[]
  loading: boolean
  error: string | null
}

/**
 * One collection's names, held for the page's lifetime.
 *
 * The server route already caches across requests and instances; this second
 * layer just spares a round trip when switching back to a tab already opened in
 * this session, and keeps the grid from flashing empty while a search runs.
 */
const cache = new Map<string, IconCollection>()

export const useIconCollection = ({
  prefix,
  enabled = true,
}: UseIconCollectionOptions): UseIconCollectionResult => {
  const [collection, setCollection] = useState<IconCollection>(() =>
    prefix ? (cache.get(prefix) ?? EMPTY_COLLECTION) : EMPTY_COLLECTION,
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!prefix) {
      setCollection(EMPTY_COLLECTION)
      setLoading(false)
      setError(null)
      return
    }

    // Serve the cache even while disabled: the picker disables this hook during
    // a search, and dropping the names would make the "showing N of M" count
    // and the browse grid flash empty on every keystroke.
    const cached = cache.get(prefix)
    if (cached) {
      setCollection(cached)
      setLoading(false)
      setError(null)
      return
    }

    if (!enabled) {
      setLoading(false)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const load = async () => {
      try {
        // the route proxies Iconify and caches the parsed result server-side,
        // so this receives the normalised shape ready to use
        const response = await fetch(`/api/icons/collection?prefix=${encodeURIComponent(prefix)}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Icon collection failed (HTTP ${response.status})`)

        const resolved = (await response.json()) as IconCollection

        cache.set(prefix, resolved)
        setCollection(resolved)
        setError(null)
      } catch (caught) {
        if (controller.signal.aborted) return

        setCollection(EMPTY_COLLECTION)
        setError(caught instanceof Error ? caught.message : 'Icon collection failed')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    void load()

    return () => controller.abort()
  }, [
    prefix,
    enabled,
  ])

  return {
    icons: collection.icons,
    categories: collection.categories,
    loading,
    error,
  }
}
