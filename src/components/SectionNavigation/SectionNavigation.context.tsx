import React from 'react'

import type { SectionNavigationContextValue } from './SectionNavigation.types'

export const initialSectionNavigationContextValue: SectionNavigationContextValue = {
  setActiveAnchor: () => undefined,
}

export const SectionNavigationContext = React.createContext<SectionNavigationContextValue>(
  initialSectionNavigationContextValue,
)
