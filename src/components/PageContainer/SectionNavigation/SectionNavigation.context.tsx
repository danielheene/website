import React from 'react'
import { SectionNavigationContextValue } from './SectionNavigation.types'

export const initialSectionNavigationContextValue: SectionNavigationContextValue = {
  registerAnchor: () => undefined,
  setActiveAnchor: () => undefined,
}

export const SectionNavigationContext = React.createContext<SectionNavigationContextValue>(initialSectionNavigationContextValue)
