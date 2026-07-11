'use client'

import { usePathname } from 'next/navigation'

import React from 'react'

import { UmamiChartsProvider } from './UmamiChartsProvider'

interface UmamiChartsContainerProps {
  children: React.ReactNode
}

export const UmamiChartsContainer = ({ children }: UmamiChartsContainerProps) => {
  const pathname = usePathname()

  return pathname === '/admin' ? <UmamiChartsProvider>{children}</UmamiChartsProvider> : children
}
