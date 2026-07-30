'use client'

import { type JSX, type ReactNode, useCallback, useEffect, useMemo, useReducer } from 'react'
import { usePreferences } from '@payloadcms/ui'

import {
  initialUmamiChartsState,
  UmamiChartsContext,
} from '@/contexts/UmamiCharts/UmamiCharts.context'
import type { UmamiChartsAction, UmamiChartsState } from '@/contexts/UmamiCharts/UmamiCharts.types'
import { Interval } from '@/lib/date'
import {
  fetchEvents,
  fetchPageViews,
  fetchPaths,
  fetchStats,
  fetchWebsite,
} from '@/lib/UmamiHandler'

interface UmamiChartsProviderProps {
  children: ReactNode
}

const reducer = (state: UmamiChartsState, action: UmamiChartsAction) => {
  switch (action.type) {
    case 'SET_SELECTED_TIME_SPAN':
      return {
        ...state,
        selectedInterval: action.payload,
      }
    case 'SET_WEBSITE_DATA':
      return {
        ...state,
        website: action.payload,
      }
    case 'REGISTER_WIDGET':
      return {
        ...state,
        [action.payload.widgetId]: {
          ...state[action.payload.widgetId],
          hasWidget: true,
        },
      }
    case 'UNREGISTER_WIDGET':
      return {
        ...state,
        [action.payload.widgetId]: {
          ...state[action.payload.widgetId],
          hasWidget: false,
        },
      }
    case 'SET_STATS_DATA':
      return {
        ...state,
        stats: {
          ...state.stats,
          data: action.payload.data,
        },
      }
    case 'SET_STATS_LOADING':
      return {
        ...state,
        stats: {
          ...state.stats,
          dataIsLoading: action.payload.isLoading,
        },
      }
    case 'SET_EVENTS_DATA':
      return {
        ...state,
        events: {
          ...state.events,
          data: action.payload.data,
        },
      }
    case 'SET_EVENTS_LOADING':
      return {
        ...state,
        events: {
          ...state.events,
          dataIsLoading: action.payload.isLoading,
        },
      }
    case 'SET_PATHS_DATA':
      return {
        ...state,
        paths: {
          ...state.paths,
          data: action.payload.data,
        },
      }
    case 'SET_PATHS_LOADING':
      return {
        ...state,
        paths: {
          ...state.paths,
          dataIsLoading: action.payload.isLoading,
        },
      }
    case 'SET_PAGE_VIEWS_DATA':
      return {
        ...state,
        pageViews: {
          ...state.pageViews,
          data: action.payload.data,
        },
      }
    case 'SET_PAGE_VIEWS_LOADING':
      return {
        ...state,
        pageViews: {
          ...state.pageViews,
          dataIsLoading: action.payload.isLoading,
        },
      }
    default:
      return state
  }
}

const preferencesKey = 'umami-charts:time-range'

export const UmamiChartsProvider = ({ children }: UmamiChartsProviderProps): JSX.Element => {
  const { getPreference, setPreference } = usePreferences()
  const [state, dispatch] = useReducer(reducer, initialUmamiChartsState)
  const {
    selectedInterval,
    website,
    stats: { hasWidget: statsHasWidget },
    events: { hasWidget: eventsHasWidget },
    pageViews: { hasWidget: pageViewsHasWidget },
    paths: { hasWidget: pathsHasWidget },
  } = state

  useEffect(() => {
    if (statsHasWidget && selectedInterval) {
      dispatch({
        type: 'SET_STATS_LOADING',
        payload: {
          isLoading: true,
        },
      })
      fetchStats({
        startAt: selectedInterval.ISOStringStartDate,
        endAt: selectedInterval.ISOStringEndDate,
        unit: 'day',
      })
        .then((data) =>
          dispatch({
            type: 'SET_STATS_DATA',
            payload: {
              data,
            },
          }),
        )
        .finally(() =>
          dispatch({
            type: 'SET_STATS_LOADING',
            payload: {
              isLoading: false,
            },
          }),
        )
    }
  }, [
    selectedInterval,
    statsHasWidget,
  ])

  useEffect(() => {
    if (eventsHasWidget && selectedInterval) {
      dispatch({
        type: 'SET_EVENTS_LOADING',
        payload: {
          isLoading: true,
        },
      })
      fetchEvents({
        startAt: selectedInterval.ISOStringStartDate,
        endAt: selectedInterval.ISOStringEndDate,
      })
        .then((data) =>
          dispatch({
            type: 'SET_EVENTS_DATA',
            payload: {
              data,
            },
          }),
        )
        .finally(() =>
          dispatch({
            type: 'SET_EVENTS_LOADING',
            payload: {
              isLoading: false,
            },
          }),
        )
    }
  }, [
    selectedInterval,
    eventsHasWidget,
  ])

  useEffect(() => {
    if (pathsHasWidget && selectedInterval) {
      dispatch({
        type: 'SET_PATHS_LOADING',
        payload: {
          isLoading: true,
        },
      })
      fetchPaths({
        startAt: selectedInterval.ISOStringStartDate,
        endAt: selectedInterval.ISOStringEndDate,
      })
        .then((data) =>
          dispatch({
            type: 'SET_PATHS_DATA',
            payload: {
              data,
            },
          }),
        )
        .finally(() =>
          dispatch({
            type: 'SET_PATHS_LOADING',
            payload: {
              isLoading: false,
            },
          }),
        )
    }
  }, [
    selectedInterval,
    pathsHasWidget,
  ])

  useEffect(() => {
    if (pageViewsHasWidget && selectedInterval) {
      dispatch({
        type: 'SET_PAGE_VIEWS_LOADING',
        payload: {
          isLoading: true,
        },
      })
      fetchPageViews({
        startAt: selectedInterval.ISOStringStartDate,
        endAt: selectedInterval.ISOStringEndDate,
        unit: 'day',
        timezone: 'Europe/Berlin',
      })
        .then((data) =>
          dispatch({
            type: 'SET_PAGE_VIEWS_DATA',
            payload: {
              data,
            },
          }),
        )
        .finally(() =>
          dispatch({
            type: 'SET_PAGE_VIEWS_LOADING',
            payload: {
              isLoading: false,
            },
          }),
        )
    }
  }, [
    selectedInterval,
    pageViewsHasWidget,
  ])

  const registerControlBar = useCallback(() => {
    if (!website) {
      fetchWebsite()
        .then((data) => {
          dispatch({
            type: 'SET_WEBSITE_DATA',
            payload: data,
          })
          console.info('Umami Charts website data loaded')
        })
        .catch((error) => {
          console.error('Umami Charts website data could not be loaded', error)
        })
    }
  }, [
    website,
  ])

  const registerWidget = useCallback((widgetId: 'stats' | 'pageViews' | 'events' | 'paths') => {
    dispatch({
      type: 'REGISTER_WIDGET',
      payload: {
        widgetId,
      },
    })
    return () =>
      dispatch({
        type: 'UNREGISTER_WIDGET',
        payload: {
          widgetId,
        },
      })
  }, [])

  const setSelectedInterval = useCallback(
    (startAt: Date, endAt: Date) => {
      console.log('setSelectedInterval', startAt, endAt)
      setPreference(
        preferencesKey,
        [
          startAt.toISOString(),
          endAt.toISOString(),
        ],
        true,
      )
        .then(() => {
          dispatch({
            type: 'SET_SELECTED_TIME_SPAN',
            payload: new Interval(startAt, endAt),
          })
        })
        .catch((error) => {
          console.error('Umami Charts preferences could not be saved', error)
        })
    },
    [
      setPreference,
    ],
  )

  useEffect(() => {
    getPreference<
      [
        string,
        string,
      ]
    >(preferencesKey)
      .then((preferences) => {
        if (
          Array.isArray(preferences) &&
          preferences.length === 2 &&
          preferences.every((value) => typeof value === 'string')
        ) {
          dispatch({
            type: 'SET_SELECTED_TIME_SPAN',
            payload: new Interval(...preferences),
          })
        }
      })
      .catch((error) => {
        console.error('Umami Charts preferences could not be loaded', error)
      })
  }, [
    getPreference,
  ])

  const value = useMemo(
    () => ({
      ...state,
      registerControlBar,
      registerWidget,
      setSelectedInterval,
    }),
    [
      state,
      registerControlBar,
      registerWidget,
      setSelectedInterval,
    ],
  )

  return <UmamiChartsContext value={value}>{children}</UmamiChartsContext>
}
