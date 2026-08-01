'use client'

import { useEffect, useState } from 'react'

/**
 * Base URL of the Iconify API. The project self-hosts one (see
 * `src/components/Icon/Icon.tsx`), so search stays on the same origin as the
 * icon data that will eventually be rendered.
 */
export const ICONIFY_API = 'https://icons.heene.io'

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

    if (!enabled || trimmed.length < 2) {
      setIcons([])
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    setLoading(true)

    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          query: trimmed,
          limit: String(limit),
        })
        if (prefix) params.set('prefix', prefix)

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
        if ((caught as Error).name === 'AbortError') return
        setIcons([])
        setError((caught as Error).message)
      } finally {
        setLoading(false)
      }
    }, 250)

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
