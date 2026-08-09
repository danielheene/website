'use client'

import React from 'react'

import { SectionNavigationContext } from './SectionNavigation.context'
import type { SectionNavigationContextValue } from './SectionNavigation.types'

export const useSectionNavigation = () => {
  const context = React.useContext<SectionNavigationContextValue>(SectionNavigationContext)
  if (context === undefined) {
    throw new Error('useSectionNavigation must be used within a SectionNavigationProvider')
  }
  return context
}
