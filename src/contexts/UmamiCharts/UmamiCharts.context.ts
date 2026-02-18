'use client'

import React from 'react'

import type { UmamiChartsContextValue } from './UmamiCharts.types'

export const initialUmamiChartsContextValue: UmamiChartsContextValue = {
  paths: [],
}

export const UmamiChartsContext = React.createContext<UmamiChartsContextValue>(initialUmamiChartsContextValue)
