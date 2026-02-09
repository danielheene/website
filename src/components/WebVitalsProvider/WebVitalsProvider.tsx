'use client'

import { initializeWebVitals } from '@/lib/initializeWebVitals'
import { ReactNode, useEffect } from 'react'

export function WebVitalsProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    initializeWebVitals()
  }, [])
  return <>{children}</>
}
