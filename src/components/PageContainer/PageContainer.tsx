import type { JSX, ReactNode } from 'react'

import { SectionNavigation } from '@/components/SectionNavigation'
import type { ExtractedHeading } from '@/lib/extractHeadings'
import type { PageLayout } from '@/types/payload'

interface PageContainerProps {
  layout?: PageLayout
  children: ReactNode
  /**
   * The page's block sections, extracted on the server so the navigation
   * renders with the page.
   */
  sections?: Pick<ExtractedHeading, 'id' | 'title'>[]
}

export const PageContainer = ({
  layout: _layout = 'richText',
  sections = [],
  children,
}: PageContainerProps): JSX.Element => (
  <>
    <SectionNavigation sections={sections} />
    <main>{children}</main>
  </>
)
