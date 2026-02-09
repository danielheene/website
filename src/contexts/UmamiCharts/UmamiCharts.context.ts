'use client'

import React from 'react'
import { UmamiChartsContextValue } from './UmamiCharts.types'

export const initialUmamiChartsContextValue: UmamiChartsContextValue = {
  paths: [],
}

export const UmamiChartsContext = React.createContext<UmamiChartsContextValue>(initialUmamiChartsContextValue)
