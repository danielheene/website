import type React from 'react'

export type SectionNavigationAnchor = {
  id: string
  title: string
  active: boolean
}

export type SetActiveAnchorFunction = (id: string) => void

export type SetScrollingToAnchorFunction = (id: string) => void

export interface SectionNavigationContextValue {
  setActiveAnchor: SetActiveAnchorFunction
}

export interface SectionNavigationProviderProps {
  /**
   * Sections derived from the page's blocks on the server, so the navigation
   * renders with the page instead of assembling as children mount.
   */
  sections?: Omit<SectionNavigationAnchor, 'active'>[]
  children: React.ReactNode
}
