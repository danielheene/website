'use client'

import { initializeWebVitals } from '@/lib/otel/initializeWebVitals'
import { ReactNode, useEffect } from 'react'

export function WebVitalsProvider({ children }: { children?: ReactNode }) {
  useEffect(() => {
    initializeWebVitals()
  }, [])
  return <>{children}</>
}
