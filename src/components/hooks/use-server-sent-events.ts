'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/** Interval the server pings at; see `app/(frontend)/api/sse/route.ts`. */
const SERVER_HEARTBEAT_INTERVAL_MS = 30_000

/** Missed heartbeats tolerated before the connection is treated as stale. */
const STALE_AFTER_MISSED_HEARTBEATS = 2

export type SSEStatus = 'connecting' | 'open' | 'closed'

export interface UseServerSentEventsOptions<T> {
  /** Redis channel to subscribe to. */
  channel: string
  /** Called for every message. Kept in a ref, so it need not be memoized. */
  onMessage?: (data: T) => void
  /** Set false to keep the connection closed (e.g. behind a feature flag). */
  enabled?: boolean
}

export interface UseServerSentEventsResult<T> {
  /** Most recent message, or null before the first one arrives. */
  data: T | null
  status: SSEStatus
  /** Last parse or transport error; cleared on a successful reconnect. */
  error: Error | null
  /** Drops and re-establishes the connection. */
  reconnect: () => void
}

/**
 * Subscribes to the SSE endpoint and yields the latest message.
 *
 * `EventSource` reconnects on its own, but a connection can also go quiet
 * without erroring — a sleeping tab or an intermediary dropping the stream.
 * The server's heartbeat is therefore used as a liveness signal: if no traffic
 * arrives within a couple of intervals, the connection is torn down and
 * reopened rather than left silently dead.
 */
export const useServerSentEvents = <T = unknown>({
  channel,
  onMessage,
  enabled = true,
}: UseServerSentEventsOptions<T>): UseServerSentEventsResult<T> => {
  const [data, setData] = useState<T | null>(null)
  const [status, setStatus] = useState<SSEStatus>('closed')
  const [error, setError] = useState<Error | null>(null)
  const [reconnectToken, setReconnectToken] = useState(0)

  // held in a ref so a caller passing an inline function does not tear the
  // connection down on every render
  const onMessageRef = useRef(onMessage)
  useEffect(() => {
    onMessageRef.current = onMessage
  }, [
    onMessage,
  ])

  const reconnect = useCallback(() => {
    setReconnectToken((token) => token + 1)
  }, [])

  useEffect(() => {
    if (!enabled || !channel) {
      setStatus('closed')
      return
    }

    // reconnectToken is what re-runs this effect: reconnect() bumps it, which
    // tears the EventSource down and opens a fresh one. Carrying it in the URL
    // both makes that dependency real rather than incidental, and stops a
    // forced reconnect from being served a cached response.
    //
    // Built by hand rather than with URLSearchParams: that encodes a space as
    // `+` (form encoding) where encodeURIComponent emits `%20`. Both decode the
    // same server-side, but the channel name is asserted verbatim in tests and
    // there is no reason to change the wire format here.
    const source = new EventSource(
      `/api/sse?channel=${encodeURIComponent(channel)}` +
        (reconnectToken > 0 ? `&r=${reconnectToken}` : ''),
    )
    setStatus('connecting')

    let lastActivity = Date.now()

    // comments (the server's `: ping`) do not fire events, but they do keep
    // the stream flowing; `open` plus message traffic is the signal available
    // to the client, so both refresh the liveness timestamp
    const markActive = () => {
      lastActivity = Date.now()
    }

    source.onopen = () => {
      markActive()
      setStatus('open')
      setError(null)
    }

    source.onmessage = (event) => {
      markActive()
      setStatus('open')

      try {
        // the publisher JSON-stringifies every payload
        const parsed = JSON.parse(event.data) as T
        setData(parsed)
        setError(null)
        onMessageRef.current?.(parsed)
      } catch (caught) {
        setError(
          new Error(`Failed to parse SSE payload on "${channel}": ${(caught as Error).message}`),
        )
      }
    }

    source.onerror = () => {
      // EventSource retries on its own unless it has been closed outright
      setStatus(source.readyState === EventSource.CLOSED ? 'closed' : 'connecting')
      setError(new Error(`Connection to "${channel}" was interrupted`))
    }

    const staleThreshold = SERVER_HEARTBEAT_INTERVAL_MS * STALE_AFTER_MISSED_HEARTBEATS
    const staleCheck = setInterval(() => {
      if (Date.now() - lastActivity <= staleThreshold) return
      // force a fresh connection; the effect re-runs via the token
      setError(new Error(`No activity on "${channel}"; reconnecting`))
      reconnect()
    }, SERVER_HEARTBEAT_INTERVAL_MS)

    return () => {
      clearInterval(staleCheck)
      source.close()
      setStatus('closed')
    }
  }, [
    channel,
    enabled,
    reconnectToken,
    reconnect,
  ])

  return {
    data,
    status,
    error,
    reconnect,
  }
}
