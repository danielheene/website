import type * as Umami from '@umami/api-client'

export interface UmamiChartsContextValue {
  paths: Array<Umami.WebsiteMetric>
}

export interface UmamiChartsInternalState {
  startAt: string
  endAt: string
}
//
