'use client'

import { type ReactNode, useEffect } from 'react'

import { initializeWebVitals } from '@/lib/otel/initializeWebVitals'

export function WebVitalsProvider({ children }: { children?: ReactNode }) {
  useEffect(() => {
    initializeWebVitals()
  }, [])
  return <>{children}</>
}
