'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@payloadcms/ui'

import { UmamiChartsProvider } from './UmamiChartsProvider'

interface UmamiChartsContainerProps {
  children: React.ReactNode
}

export const UmamiChartsContainer = ({ children }: UmamiChartsContainerProps) => {
  const pathname = usePathname()
  const { user } = useAuth()

  if (!user || !pathname.startsWith('/admin')) {
    return children
  }

  return <UmamiChartsProvider>{children}</UmamiChartsProvider>
}
