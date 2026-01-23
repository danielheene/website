'use client'

import { SectionNavigationProvider } from '@/components/PageContainer/SectionNavigation'
import { PageLayout } from '@payload-types'
import { JSX, ReactNode } from 'react'

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
