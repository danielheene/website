'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

export interface UseScrollSpyOptions {
  /**
   * Fraction of the viewport height, from the top, that counts as the reading
   * line: an anchor is passed once its top is above it.
   */
  readingLine?: number
}

export interface ScrollSpy {
  activeId: string | null
  /** Smooth-scrolls to an anchor and keeps it active until the scroll ends. */
  scrollTo: (id: string) => void
}

// Fallback for browsers without `scrollend`: release the lock after this long.
const SCROLL_LOCK_TIMEOUT_MS = 1500

/**
 * Tracks which of the given anchors the reader is at: the last one whose top
 * has passed the reading line, or the last one overall once the page is
 * scrolled to the bottom (short final sections would otherwise never win).
 *
 * While `scrollTo` animates to a target, the anchors scrolled past are not
 * reported, so the navigation does not flicker through them.
 */
export const useScrollSpy = (
  ids: string[],
  { readingLine = 1 / 3 }: UseScrollSpyOptions = {},
): ScrollSpy => {
  const [activeId, setActiveId] = useState<string | null>(ids[0] ?? null)
  const lockedIdRef = useRef<string | null>(null)
  const unlockRef = useRef<() => void>(() => undefined)

  // Callers usually pass a fresh array each render; the joined key keeps the
  // effect from re-subscribing unless the anchors actually change.
  const idsKey = ids.join('\n')

  useEffect(() => {
    const anchorIds = idsKey ? idsKey.split('\n') : []

    if (anchorIds.length === 0) return

    const update = () => {
      if (lockedIdRef.current) return

      const line = window.innerHeight * readingLine

      const passed = anchorIds.filter((id) => {
        const element = document.getElementById(id)

        return element ? element.getBoundingClientRect().top <= line : false
      })

      const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 2

      const next = atBottom ? anchorIds.at(-1) : (passed.at(-1) ?? anchorIds[0])

      setActiveId((current) => (current === next ? current : next))
    }

    let lockTimeout: ReturnType<typeof setTimeout> | undefined

    unlockRef.current = () => {
      clearTimeout(lockTimeout)
      lockTimeout = setTimeout(() => {
        lockedIdRef.current = null
        update()
      }, SCROLL_LOCK_TIMEOUT_MS)
    }

    const handleScrollEnd = () => {
      if (!lockedIdRef.current) return

      clearTimeout(lockTimeout)
      lockedIdRef.current = null
      update()
    }

    update()

    window.addEventListener('scroll', update, {
      passive: true,
    })
    window.addEventListener('scrollend', handleScrollEnd)
    window.addEventListener('resize', update)

    return () => {
      clearTimeout(lockTimeout)
      window.removeEventListener('scroll', update)
      window.removeEventListener('scrollend', handleScrollEnd)
      window.removeEventListener('resize', update)
    }
  }, [idsKey, readingLine])

  const scrollTo = useCallback((id: string) => {
    const element = document.getElementById(id)

    if (!element) return

    lockedIdRef.current = id
    setActiveId(id)
    unlockRef.current()

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    element.scrollIntoView({
      behavior: reducedMotion ? 'auto' : 'smooth',
      block: 'start',
    })

    // window.history.replaceState(null, '', `#${id}`)
  }, [])

  return {
    activeId,
    scrollTo,
  }
}
