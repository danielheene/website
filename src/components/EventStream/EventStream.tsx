'use client'

import type { JSX, ReactNode } from 'react'

import {
  type SSEStatus,
  type UseServerSentEventsResult,
  useServerSentEvents,
} from '@/hooks/use-server-sent-events'

export interface EventStreamProps<T> {
  /** Redis channel to subscribe to. */
  channel: string
  /**
   * Rendered on every message. Receives the stream state so the caller can
   * show its own connecting/offline treatment.
   */
  children: (state: UseServerSentEventsResult<T>) => ReactNode
  /** Rendered instead of `children` until the first message arrives. */
  fallback?: ReactNode
  onMessage?: (data: T) => void
  enabled?: boolean
}

/**
 * Subscribes to a server-sent event channel and renders its latest payload.
 *
 * A render-prop rather than a fixed layout: every consumer of a channel wants
 * different markup, and the stream state (status, error, reconnect) belongs in
 * the caller's hands.
 *
 * @example
 * <EventStream<OverallStatusResponse> channel="service-status">
 *   {({ data, status }) => <span>{data?.message ?? status}</span>}
 * </EventStream>
 */
export const EventStream = <T,>({
  channel,
  children,
  fallback = null,
  onMessage,
  enabled,
}: EventStreamProps<T>): JSX.Element => {
  const state = useServerSentEvents<T>({
    channel,
    onMessage,
    enabled,
  })

  if (state.data === null && fallback !== null) {
    return <>{fallback}</>
  }

  return <>{children(state)}</>
}

export type { SSEStatus }
