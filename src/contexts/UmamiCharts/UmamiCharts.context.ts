'use client'

import { subWeeks } from 'date-fns'
import React from 'react'

import type { UmamiChartsContextValue, UmamiChartsMethods, UmamiChartsState } from './UmamiCharts.types'

export const initialUmamiChartsState: UmamiChartsState = {
  selectedTimeSpan: {
    startAt: subWeeks(new Date(), 2),
    endAt: new Date(),
  },
  website: null,
  stats: {
    hasWidget: false,
    data: null,
    dataIsLoading: false,
  },
  events: {
    hasWidget: false,
    data: null,
    dataIsLoading: false,
  },
  pageViews: {
    hasWidget: false,
    data: null,
    dataIsLoading: false,
  },
  paths: {
    hasWidget: false,
    data: null,
    dataIsLoading: false,
  },
}

export const initialUmamiChartsMethods: UmamiChartsMethods = {
  registerWidget: () => () => {},
  registerControlBar: () => {},
  setSelectedTimeSpan: () => {},
}

export const initialUmamiChartsContextValue: UmamiChartsContextValue = {
  ...initialUmamiChartsState,
  ...initialUmamiChartsMethods,
}

export const UmamiChartsContext = React.createContext<UmamiChartsContextValue>(initialUmamiChartsContextValue)
