'use client'

import type { PageLayout } from '@payload-types'
import type { JSX, ReactNode } from 'react'

import { SectionNavigationProvider } from '@/components/PageContainer/SectionNavigation'

interface PageContainerProps {
  layout?: PageLayout
  children: ReactNode
  sectionNavigation?: [{ id: string; title: string; active: boolean }[] | null]
}
export const PageContainer = ({ layout = 'default', children }: PageContainerProps): JSX.Element => {
  return (
    <SectionNavigationProvider>
      <main>{children}</main>
    </SectionNavigationProvider>
  )
}
