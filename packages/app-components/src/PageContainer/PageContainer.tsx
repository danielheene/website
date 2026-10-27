'use client'

import type { JSX, ReactNode } from 'react'

import type { ExtractedSection } from '@website/lib/extractSections'
import type { PageLayout } from '@website/types/payload'

import { SectionNavigationProvider } from '../SectionNavigation/index'

interface PageContainerProps {
  layout?: PageLayout
  children: ReactNode
  /**
   * Sections extracted from the page's blocks on the server. Passed straight to
   * the navigation so it renders with the page.
   */
  sections?: ExtractedSection[]
}

export const PageContainer = ({
  layout: _layout = 'default',
  sections,
  children,
}: PageContainerProps): JSX.Element => {
  return (
    <SectionNavigationProvider sections={sections}>
      <main>{children}</main>
    </SectionNavigationProvider>
  )
}
