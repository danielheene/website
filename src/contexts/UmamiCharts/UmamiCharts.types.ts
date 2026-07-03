import type {
  UmamiEvent,
  UmamiPageViews,
  UmamiPath,
  UmamiStats,
  UmamiWebsite,
} from '@/lib/UmamiHandler'

export type UmamiChartsState = {
  selectedTimeSpan: {
    startAt: Date | null
    endAt: Date | null
  }
  website: UmamiWebsite | null
  stats: {
    hasWidget: boolean
    data: UmamiStats | null
    dataIsLoading: boolean
  }
  events: {
    hasWidget: boolean
    data: UmamiEvent[] | null
    dataIsLoading: boolean
  }
  paths: {
    hasWidget: boolean
    data: UmamiPath[] | null
    dataIsLoading: boolean
  }
  pageViews: {
    hasWidget: boolean
    data: UmamiPageViews | null
    dataIsLoading: boolean
  }
}

export type UmamiChartsMethods = {
  registerControlBar: () => void
  registerWidget: (widgetId: 'stats' | 'events' | 'paths' | 'pageViews') => () => void
  setSelectedTimeSpan: (startAt: Date, endAt: Date) => void
}

export type UmamiChartsContextValue = UmamiChartsState & UmamiChartsMethods

export type UmamiChartsAction =
  | {
      type: 'SET_SELECTED_TIME_SPAN'
      payload: {
        startAt: Date
        endAt: Date
      }
    }
  | {
      type: 'SET_WEBSITE_DATA'
      payload: UmamiWebsite
    }
  | {
      type: 'REGISTER_WIDGET'
      payload: {
        widgetId: 'stats' | 'events' | 'paths' | 'pageViews'
      }
    }
  | {
      type: 'UNREGISTER_WIDGET'
      payload: {
        widgetId: 'stats' | 'events' | 'paths' | 'pageViews'
      }
    }
  | {
      type: 'SET_STATS_DATA'
      payload: {
        data: UmamiStats | null
      }
    }
  | {
      type: 'SET_STATS_LOADING'
      payload: {
        isLoading: boolean
      }
    }
  | {
      type: 'SET_EVENTS_DATA'
      payload: {
        data: UmamiEvent[] | null
      }
    }
  | {
      type: 'SET_EVENTS_LOADING'
      payload: {
        isLoading: boolean
      }
    }
  | {
      type: 'SET_PATHS_DATA'
      payload: {
        data: UmamiPath[] | null
      }
    }
  | {
      type: 'SET_PATHS_LOADING'
      payload: {
        isLoading: boolean
      }
    }
  | {
      type: 'SET_PAGE_VIEWS_DATA'
      payload: {
        data: UmamiPageViews | null
      }
    }
  | {
      type: 'SET_PAGE_VIEWS_LOADING'
      payload: {
        isLoading: boolean
      }
    }
