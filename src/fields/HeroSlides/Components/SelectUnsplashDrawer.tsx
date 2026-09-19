'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@payloadcms/ui'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { isUnsplashConfigured } from '@/lib/unsplash/isConfigured'
import { searchPhotos } from '@/lib/unsplash/searchPhotos'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'

import { MediaPickerDrawer } from './MediaPickerDrawer'

interface SelectUnsplashDrawerProps {
  slug: string
  /** The importing row's id, so its card can show a per-item pending state. */
  importingId: string | null
  onSelectAction: (result: UnsplashSearchResult) => void
}

/**
 * Unsplash-search source for `AddSlideMenu`, through the shared
 * `MediaPickerDrawer` shell. Deliberately separate from
 * `src/components/AdminPanel/UnsplashSearch` — that component is a
 * standalone MediaImages list-menu item with its own trigger/Modal
 * lifecycle (`useListDrawerContext`), reused elsewhere; this one is scoped
 * to the hero-slide add flow, which needs the *result* handed back for an
 * optimistic slide insert (see `AddSlideMenu`'s upload/import wiring)
 * rather than the `onSelect`-into-a-relationship-field callback the other
 * component uses. Both share the same underlying `searchPhotos`/`importPhoto`
 * calls — only the surrounding chrome and the selection callback differ.
 */
export const SelectUnsplashDrawer = ({
  slug,
  importingId,
  onSelectAction,
}: SelectUnsplashDrawerProps) => {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<UnsplashSearchResult[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)

  const searchSeq = useRef(0)

  const runSearch = useCallback(async (nextQuery: string, nextPage: number) => {
    const seq = ++searchSeq.current
    setIsSearching(true)
    setError(null)

    try {
      const response = await searchPhotos({
        query: nextQuery,
        page: nextPage,
      })
      if (seq !== searchSeq.current) return

      setResults((previous) =>
        nextPage === 1
          ? response.results
          : [
              ...previous,
              ...response.results,
            ],
      )
      setTotalPages(response.totalPages)
      setPage(nextPage)
    } catch (searchError) {
      if (seq !== searchSeq.current) return
      setError(extractErrorMessage(searchError))
    } finally {
      if (seq === searchSeq.current) setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    void isUnsplashConfigured().then(setIsConfigured)
  }, [])

  useEffect(() => {
    const trimmed = query.trim()
    if (!trimmed) {
      setResults([])
      setTotalPages(0)
      return
    }

    const timeout = setTimeout(() => {
      void runSearch(trimmed, 1)
    }, 400)

    return () => clearTimeout(timeout)
  }, [
    query,
    runSearch,
  ])

  const handleLoadMore = useCallback(() => {
    void runSearch(query.trim(), page + 1)
  }, [
    page,
    query,
    runSearch,
  ])

  if (isConfigured === false) {
    return (
      <MediaPickerDrawer
        emptyMessage="Unsplash isn't configured. Set `UNSPLASH_ACCESS_KEY` to enable this."
        items={[]}
        slug={slug}
        title="Import from Unsplash"
      />
    )
  }

  return (
    <MediaPickerDrawer
      emptyMessage={
        error
          ? error
          : query.trim()
            ? `No results for "${query.trim()}".`
            : 'Search for a photo to import.'
      }
      footer={
        results.length > 0 && page < totalPages ? (
          <Button
            buttonStyle="secondary"
            disabled={isSearching}
            onClick={handleLoadMore}
            type="button"
          >
            {isSearching ? 'Loading…' : 'Load more'}
          </Button>
        ) : undefined
      }
      isLoading={isSearching && results.length === 0}
      items={results.map((result) => ({
        id: result.id,
        label: `${result.description || 'Unsplash photo'} by ${result.photographerName}`,
        onSelect: () => onSelectAction(result),
        disabled: importingId !== null,
        thumbnail: (
          // biome-ignore lint/performance/noImgElement: thumbnail preview of Unsplash search results, not the imported asset, so next/image optimization isn't warranted
          <img
            alt={result.description}
            className="h-full w-full object-cover"
            loading="lazy"
            src={result.thumbUrl}
          />
        ),
      }))}
      slug={slug}
      title="Import from Unsplash"
      toolbar={
        <input
          aria-label="Search Unsplash"
          className="mb-4 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search for a photo…"
          type="text"
          value={query}
        />
      }
    />
  )
}

export default SelectUnsplashDrawer
