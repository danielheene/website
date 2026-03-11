'use client'

import { type JSX, type ReactNode, useCallback, useEffect, useMemo, useReducer, useState } from 'react'

import { initialUmamiChartsState, UmamiChartsContext } from '@/contexts/UmamiCharts/UmamiCharts.context'
import type { UmamiChartsAction, UmamiChartsState } from '@/contexts/UmamiCharts/UmamiCharts.types'
import { fetchEvents, fetchPageViews, fetchStats, fetchPaths, fetchWebsite } from '@/lib/UmamiHandler'
import { usePreferences } from '@payloadcms/ui'

interface UmamiChartsProviderProps {
  children: ReactNode
}

const reducer = (state: UmamiChartsState, action: UmamiChartsAction) => {
  switch (action.type) {
    case 'SET_SELECTED_TIME_SPAN':
      return { ...state, selectedTimeSpan: { startAt: action.payload.startAt, endAt: action.payload.endAt } }
    case 'SET_WEBSITE_DATA':
      return { ...state, website: action.payload }
    case 'REGISTER_WIDGET':
      return { ...state, [action.payload.widgetId]: { ...state[action.payload.widgetId], hasWidget: true } }
    case 'UNREGISTER_WIDGET':
      return { ...state, [action.payload.widgetId]: { ...state[action.payload.widgetId], hasWidget: false } }
    case 'SET_STATS_DATA':
      return { ...state, stats: { ...state.stats, data: action.payload.data } }
    case 'SET_STATS_LOADING':
      return { ...state, stats: { ...state.stats, dataIsLoading: action.payload.isLoading } }
    case 'SET_EVENTS_DATA':
      return { ...state, events: { ...state.events, data: action.payload.data } }
    case 'SET_EVENTS_LOADING':
      return { ...state, events: { ...state.events, dataIsLoading: action.payload.isLoading } }
    case 'SET_PATHS_DATA':
      return { ...state, paths: { ...state.paths, data: action.payload.data } }
    case 'SET_PATHS_LOADING':
      return { ...state, paths: { ...state.paths, dataIsLoading: action.payload.isLoading } }
    case 'SET_PAGE_VIEWS_DATA':
      return { ...state, pageViews: { ...state.pageViews, data: action.payload.data } }
    case 'SET_PAGE_VIEWS_LOADING':
      return { ...state, pageViews: { ...state.pageViews, dataIsLoading: action.payload.isLoading } }
    default:
      return state
  }
}

const preferencesKey = 'umami-charts:time-range'

export const UmamiChartsProvider = ({ children }: UmamiChartsProviderProps): JSX.Element => {
  const { getPreference, setPreference } = usePreferences()
  const [state, dispatch] = useReducer(reducer, initialUmamiChartsState)
  const {
    selectedTimeSpan: { startAt, endAt },
    website,
    stats: { hasWidget: statsHasWidget },
    events: { hasWidget: eventsHasWidget },
    pageViews: { hasWidget: pageViewsHasWidget },
    paths: { hasWidget: pathsHasWidget },
  } = state

  useEffect(() => {
    const asyncGetPreferences = async () => {
      const { startAt = null, endAt = null } = await getPreference<{
        startAt?: string;
        endAt?: string
      }>(preferencesKey) || {}
      if (startAt && endAt) setSelectedTimeSpan(new Date(startAt), new Date(endAt))
    }
    asyncGetPreferences()
  }, [getPreference])

  useEffect(() => {
    setPreference(preferencesKey, { startAt: startAt.toString(), endAt: endAt.toString() })
  }, [startAt, endAt, setPreference])

  useEffect(() => {
    if (statsHasWidget) {
      dispatch({ type: 'SET_STATS_LOADING', payload: { isLoading: true } })
      fetchStats({ startAt, endAt, unit: 'day' })
        .then((data) => dispatch({ type: 'SET_STATS_DATA', payload: { data } }))
        .finally(() => dispatch({ type: 'SET_STATS_LOADING', payload: { isLoading: false } }))
    }
  }, [startAt, endAt, statsHasWidget])

  useEffect(() => {
    if (eventsHasWidget) {
      dispatch({ type: 'SET_EVENTS_LOADING', payload: { isLoading: true } })
      fetchEvents({ startAt, endAt })
        .then((data) => dispatch({ type: 'SET_EVENTS_DATA', payload: { data } }))
        .finally(() => dispatch({ type: 'SET_EVENTS_LOADING', payload: { isLoading: false } }))
    }
  }, [startAt, endAt, eventsHasWidget])

  useEffect(() => {
    if (pathsHasWidget) {
      dispatch({ type: 'SET_PATHS_LOADING', payload: { isLoading: true } })
      fetchPaths({ startAt, endAt })
        .then((data) => dispatch({ type: 'SET_PATHS_DATA', payload: { data } }))
        .finally(() => dispatch({ type: 'SET_PATHS_LOADING', payload: { isLoading: false } }))
    }
  }, [startAt, endAt, pathsHasWidget])

  useEffect(() => {
    if (pageViewsHasWidget) {
      dispatch({ type: 'SET_PAGE_VIEWS_LOADING', payload: { isLoading: true } })
      fetchPageViews({ startAt, endAt, unit: 'day', timezone: 'Europe/Berlin' })
        .then((data) => dispatch({ type: 'SET_PAGE_VIEWS_DATA', payload: { data } }))
        .finally(() => dispatch({ type: 'SET_PAGE_VIEWS_LOADING', payload: { isLoading: false } }))
    }
  }, [startAt, endAt, pageViewsHasWidget])

  const registerControlBar = useCallback(() => {
    if (!website) {
      fetchWebsite().then((data) => dispatch({ type: 'SET_WEBSITE_DATA', payload: data }))
    }
  }, [website])

  const registerWidget = useCallback((widgetId: 'stats' | 'pageViews' | 'events' | 'paths') => {
    dispatch({ type: 'REGISTER_WIDGET', payload: { widgetId } })
    return () => dispatch({ type: 'UNREGISTER_WIDGET', payload: { widgetId } })
  }, [])

  const setSelectedTimeSpan = useCallback((startAt: Date, endAt: Date) => {
    dispatch({ type: 'SET_SELECTED_TIME_SPAN', payload: { startAt, endAt } })
  }, [])

  const value = useMemo(
    () => ({ ...state, registerControlBar, registerWidget, setSelectedTimeSpan }),
    [state, registerControlBar, registerWidget, setSelectedTimeSpan],
  )

  return <UmamiChartsContext value={value}>{children}</UmamiChartsContext>
}
