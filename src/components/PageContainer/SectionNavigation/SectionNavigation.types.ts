import React from 'react'

export type SectionNavigationAnchor = {
  id: string
  title: string
  active: boolean
}

export type RegisterAnchorFunction = (anchor: Omit<SectionNavigationAnchor, 'active'>) => void

export type SetActiveAnchorFunction = (id: string) => void

export type SetScrollingToAnchorFunction = (id: string) => void

export interface SectionNavigationContextValue {
  registerAnchor: RegisterAnchorFunction
  setActiveAnchor: SetActiveAnchorFunction
}

export interface SectionNavigationProviderProps {
  children: React.ReactNode
}
