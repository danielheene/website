'use client'

import React from 'react'
import { SectionNavigationContextValue } from './SectionNavigation.types'
import { SectionNavigationContext } from './SectionNavigation.context'

export const useSectionNavigation = () => {
  const context = React.useContext<SectionNavigationContextValue>(SectionNavigationContext)
  if (context === undefined) {
    throw new Error('useSectionNavigation must be used within a SectionNavigationProvider')
  }
  return context
}
