'use client'

import { type JSX, memo, useCallback, useMemo, useRef, useState } from 'react'

import { SectionNavigationContext } from './SectionNavigation.context'
import type {
  RegisterAnchorFunction,
  SectionNavigationAnchor,
  SectionNavigationProviderProps,
  SetActiveAnchorFunction,
  SetScrollingToAnchorFunction,
} from './SectionNavigation.types'
import { SectionNavigationDisplay } from './SectionNavigationDisplay'

/**
 * SectionNavigationProvider
 * provides context for registering and updating scroll anchors as also renders the navigation display
 */
export const SectionNavigationProvider = memo(({ children }: SectionNavigationProviderProps): JSX.Element => {
  const [anchors, setAnchors] = useState<SectionNavigationAnchor[]>([])

  /**
   * reference to the id of the anchor that is currently being scrolled to
   * this is used to suppress the active state of anchors that are passing by while scrolling to target anchor
   */
  const scrollingToLockRef = useRef<string | null>(null)

  /**
   * register an anchor to the navigation and filter out duplicates
   */
  const registerAnchor = useCallback<RegisterAnchorFunction>((anchor) => {
    setAnchors((anchors: SectionNavigationAnchor[]) =>
      [...anchors, { ...anchor, active: false }].filter(({ id: vid }, i, arr) => i === arr.findIndex(({ id: fid }) => fid === vid)),
    )
  }, [])

  /**
   * set anchor with matching id to active unless a scroll lock is set
   */
  const setActiveAnchor = useCallback<SetActiveAnchorFunction>((id) => {
    if (scrollingToLockRef.current && id !== scrollingToLockRef.current) return

    scrollingToLockRef.current = null
    setAnchors((anchors) => anchors.map((anchor) => ({ ...anchor, active: anchor.id === id })))
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
    [setActiveAnchor],
  )

  /**
   * memoize the context value to prevent unnecessary re-renders
   */
  const value = useMemo(
    () => ({
      setActiveAnchor,
      registerAnchor,
    }),
    [registerAnchor, setActiveAnchor],
  )

  return (
    <SectionNavigationContext.Provider value={value}>
      <SectionNavigationDisplay anchors={anchors} setScrollingToAnchor={setScrollingToAnchor} />
      {children}
    </SectionNavigationContext.Provider>
  )
})
