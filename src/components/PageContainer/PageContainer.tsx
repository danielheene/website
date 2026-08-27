'use client'

import type { JSX, ReactNode } from 'react'

import { SectionNavigationProvider } from '@/components/SectionNavigation'
import type { ExtractedSection } from '@/lib/extractSections'
import type { PageLayout } from '@/types/payload'

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
  layout = 'default',
  sections,
  children,
}: PageContainerProps): JSX.Element => {
  return (
    <SectionNavigationProvider sections={sections}>
      <main>{children}</main>
    </SectionNavigationProvider>
  )
}
