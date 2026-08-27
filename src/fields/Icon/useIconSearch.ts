'use client'

import { useEffect, useState } from 'react'

import { ICONIFY_API } from '@/components/Icon'

/** Shortest query worth sending to the API; below this, results are noise. */
export const MIN_QUERY_LENGTH = 2

/** Debounce applied to keystrokes before a search is issued, in ms. */
const SEARCH_DEBOUNCE_MS = 250

export interface UseIconSearchOptions {
  query: string
  /** Restrict results to a single Iconify collection, e.g. `simple-icons`. */
  prefix?: string
  limit?: number
  /** Skip searching entirely (e.g. while a popover is closed). */
  enabled?: boolean
}

export interface UseIconSearchResult {
  icons: string[]
  loading: boolean
  error: string | null
}

/**
 * Debounced Iconify search. Results are icon names in `prefix:name` form,
 * ready to pass to `<Icon name={…} />`.
 */
export const useIconSearch = ({
  query,
  prefix,
  limit = 96,
  enabled = true,
}: UseIconSearchOptions): UseIconSearchResult => {
  const [icons, setIcons] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const trimmed = query.trim()

    if (!enabled || trimmed.length < MIN_QUERY_LENGTH) {
      setIcons([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = setTimeout(async () => {
      const params = new URLSearchParams({
        query: trimmed,
        limit: String(limit),
      })
      if (prefix) params.set('prefix', prefix)

      try {
        const response = await fetch(`${ICONIFY_API}/search?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error(`Icon search failed (HTTP ${response.status})`)

        const data = (await response.json()) as {
          icons?: string[]
        }

        setIcons(Array.isArray(data.icons) ? data.icons : [])
        setError(null)
      } catch (caught) {
        // an aborted request was superseded by a newer one — the state it would
        // have written is already stale, so leave it to the request that won
        if (controller.signal.aborted) return

        setIcons([])
        setError(caught instanceof Error ? caught.message : 'Icon search failed')
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [
    query,
    prefix,
    limit,
    enabled,
  ])

  return {
    icons,
    loading,
    error,
  }
}
