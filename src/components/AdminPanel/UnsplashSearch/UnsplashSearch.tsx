'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Modal, toast, useListDrawerContext, useModal } from '@payloadcms/ui'

import { extractErrorMessage } from '@/lib/extractErrorMessage'
import { importPhoto } from '@/lib/unsplash/importPhoto'
import { searchPhotos } from '@/lib/unsplash/searchPhotos'
import type { UnsplashSearchResult } from '@/lib/unsplash/types'
import { CollectionSlug } from '@/types/collections'

import './UnsplashSearch.styles.css'

const MODAL_SLUG = 'unsplash-search-modal'

export const UnsplashSearch = () => {
  const { openModal, closeModal } = useModal()
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
        }

        closeModal(MODAL_SLUG)
      } catch (importError) {
        toast.error(extractErrorMessage(importError))
      } finally {
        setIsImporting(null)
      }
    },
    [
      closeModal,
      isInDrawer,
      onSelect,
    ],
  )

  return (
    <>
      <Button type="button" buttonStyle="pill" size="small" onClick={() => openModal(MODAL_SLUG)}>
        Search Unsplash…
      </Button>

      <Modal slug={MODAL_SLUG} className="unsplash-search-modal">
        <div className="unsplash-search-modal__body">
          <h3>Search Unsplash</h3>

          <input
            aria-label="Search Unsplash"
            className="unsplash-search-modal__input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search for a photo…"
            type="text"
            value={query}
          />

          {error && <p className="unsplash-search-modal__error">{error}</p>}

          {!error && query.trim() && !isSearching && results.length === 0 && (
            <p className="unsplash-search-modal__empty">No results for "{query.trim()}".</p>
          )}

          <div className="unsplash-search-modal__grid">
            {results.map((result) => (
              <button
                aria-label={`Import "${result.description || 'Unsplash photo'}" by ${result.photographerName}`}
                className="unsplash-search-modal__thumb"
                disabled={isImporting !== null}
                key={result.id}
                onClick={() => handleImport(result.id)}
                type="button"
              >
                {/** biome-ignore lint/performance/noImgElement: thumbnail preview of Unsplash search results, not the imported asset, so next/image optimization isn't warranted */}
                <img alt={result.description} loading="lazy" src={result.thumbUrl} />
                <span className="unsplash-search-modal__credit">{result.photographerName}</span>
                {isImporting === result.id && (
                  <span className="unsplash-search-modal__importing">Importing…</span>
                )}
              </button>
            ))}
          </div>

          {results.length > 0 && page < totalPages && (
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
      </Modal>
    </>
  )
}

export default UnsplashSearch
