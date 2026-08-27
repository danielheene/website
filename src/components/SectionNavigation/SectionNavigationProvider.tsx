'use client'

import { type JSX, memo, useCallback, useMemo, useRef, useState } from 'react'

import { SectionNavigationContext } from './SectionNavigation.context'
import type {
  SectionNavigationProviderProps,
  SetActiveAnchorFunction,
  SetScrollingToAnchorFunction,
} from './SectionNavigation.types'
import { SectionNavigationDisplay } from './SectionNavigationDisplay'

/**
 * SectionNavigationProvider
 *
 * Renders the section navigation from the `sections` derived on the server and
 * tracks which one is currently in view. Sections are known up front, so the
 * navigation renders with the page rather than appearing once children mount.
 */
export const SectionNavigationProvider = memo(
  ({ sections = [], children }: SectionNavigationProviderProps): JSX.Element => {
    const [activeId, setActiveId] = useState<string | null>(null)

    /**
     * reference to the id of the anchor that is currently being scrolled to
     * this is used to suppress the active state of anchors that are passing by while scrolling to target anchor
     */
    const scrollingToLockRef = useRef<string | null>(null)

    /**
     * set anchor with matching id to active unless a scroll lock is set
     */
    const setActiveAnchor = useCallback<SetActiveAnchorFunction>((id) => {
      if (scrollingToLockRef.current && id !== scrollingToLockRef.current) return

      scrollingToLockRef.current = null
      setActiveId(id)
    }, [])

    /**
     * set anchor with matching id to active and activate scroll lock
     */
    const setScrollingToAnchor = useCallback<SetScrollingToAnchorFunction>(
      (id: string) => {
        scrollingToLockRef.current = null
        setActiveAnchor(id)
        scrollingToLockRef.current = id
      },
      [
        setActiveAnchor,
      ],
    )

    const anchors = useMemo(
      () =>
        sections.map((section) => ({
          ...section,
          active: section.id === activeId,
        })),
      [
        sections,
        activeId,
      ],
    )

    /**
     * memoize the context value to prevent unnecessary re-renders
     */
    const value = useMemo(
      () => ({
        setActiveAnchor,
      }),
      [
        setActiveAnchor,
      ],
    )

    return (
      <SectionNavigationContext.Provider value={value}>
        <SectionNavigationDisplay anchors={anchors} setScrollingToAnchor={setScrollingToAnchor} />
        {children}
      </SectionNavigationContext.Provider>
    )
  },
)
