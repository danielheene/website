'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Button,
  Drawer,
  toast,
  useDrawerSlug,
  useListDrawerContext,
  useModal,
} from '@payloadcms/ui'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { importPhoto } from '@/lib/unsplash/importPhoto'
import { isUnsplashConfigured } from '@/lib/unsplash/isConfigured'
import { searchPhotos } from '@/lib/unsplash/searchPhotos'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'
import { CollectionSlug } from '@/types/collections'

import './UnsplashSearch.styles.css'

export const UnsplashSearch = () => {
  const { openModal, closeModal } = useModal()
  const drawerSlug = useDrawerSlug('unsplash-search')
  const router = useRouter()
  // Only meaningful when this component happens to render inside an upload
  // field's picker drawer — `isInDrawer` is false (and `onSelect` undefined)
  // when it's reached from the standalone MediaImages list instead.
  const { isInDrawer, onSelect } = useListDrawerContext()

  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [results, setResults] = useState<UnsplashSearchResult[]>([])
  const [totalPages, setTotalPages] = useState(0)
  const [isSearching, setIsSearching] = useState(false)
  const [isImporting, setIsImporting] = useState<string | null>(null)
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
        nextPage === 1 ? response.results : [...previous, ...response.results],
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
  }, [query, runSearch])

  const handleLoadMore = useCallback(() => {
    void runSearch(query.trim(), page + 1)
  }, [page, query, runSearch])

  const handleImport = useCallback(
    async (photoId: string) => {
      setIsImporting(photoId)

      try {
        const doc = await importPhoto({
          photoId,
        })

        toast.success('Imported from Unsplash.')

        if (isInDrawer && onSelect) {
          onSelect({
            collectionSlug: CollectionSlug.MediaImages,
            doc,
            docID: doc.id,
          })
        } else {
          // the list view is server-rendered, so the new image shows only after a refresh
          router.refresh()
        }

        closeModal(drawerSlug)
      } catch (importError) {
        toast.error(extractErrorMessage(importError))
      } finally {
        setIsImporting(null)
      }
    },
    [closeModal, drawerSlug, isInDrawer, onSelect, router],
  )

  const trimmed = query.trim()

  return (
    <>
      <Button type="button" buttonStyle="pill" size="small" onClick={() => openModal(drawerSlug)}>
        Search Unsplash…
      </Button>

      {/* the icon picker's drawer (`IconPickerDrawer`): docked panel, Payload's input styles */}
      <Drawer slug={drawerSlug} title="Search Unsplash" className="unsplash-search-drawer">
        <div className="flex size-full flex-col gap-3">
          {isConfigured === false ? (
            <p role="alert" className="text-sm text-destructive">
              Unsplash isn&apos;t configured. Set `UNSPLASH_ACCESS_KEY` to enable this.
            </p>
          ) : (
            <>
              <input
                aria-label="Search Unsplash"
                className="payload-form-input w-full"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search for a photo…"
                type="search"
                value={query}
              />

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}

              {isSearching && results.length === 0 && (
                <p className="text-sm text-muted-foreground">Searching…</p>
              )}

              {!error && !trimmed && (
                <p className="text-sm text-muted-foreground">Search for a photo to import.</p>
              )}

              {!error && trimmed && !isSearching && results.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No results for &quot;{trimmed}&quot;.
                </p>
              )}

              {results.length > 0 && (
                <div className="min-h-0 flex-1 scrollbar-none overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {results.map((result) => (
                      <button
                        aria-label={`Import "${result.description || 'Unsplash photo'}" by ${result.photographerName}`}
                        className="unsplash-search-drawer__thumb"
                        disabled={isImporting !== null}
                        key={result.id}
                        onClick={() => handleImport(result.id)}
                        type="button"
                      >
                        {/* oxlint-disable-next-line nextjs/no-img-element -- thumbnail preview of Unsplash search results, not the imported asset, so next/image optimization isn't warranted */}
                        <img alt={result.description} loading="lazy" src={result.thumbUrl} />
                        <span className="unsplash-search-drawer__credit">
                          {result.photographerName}
                        </span>
                        {isImporting === result.id && (
                          <span className="unsplash-search-drawer__importing">Importing…</span>
                        )}
                      </button>
                    ))}
                  </div>

                  {page < totalPages && (
                    <Button
                      buttonStyle="secondary"
                      disabled={isSearching}
                      onClick={handleLoadMore}
                      type="button"
                    >
                      {isSearching ? 'Loading…' : 'Load more'}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </Drawer>
    </>
  )
}

export default UnsplashSearch
