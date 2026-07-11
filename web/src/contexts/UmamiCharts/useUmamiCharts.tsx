'use client'

import { useContext } from 'react'

import { UmamiChartsContext } from './UmamiCharts.context'
import type { UmamiChartsContextValue } from './UmamiCharts.types'

export const useUmamiCharts = (): UmamiChartsContextValue => {
  const context = useContext(UmamiChartsContext)
  if (!context) throw new Error('Missing UmamiProvider in tree')
  return context
}
