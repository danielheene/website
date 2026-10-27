// @vitest-environment jsdom
import { act, renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useServerSentEvents } from './use-server-sent-events'

/** Minimal EventSource stand-in; jsdom does not implement one. */
class MockEventSource {
  static instances: MockEventSource[] = []
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSED = 2

  url: string
  readyState = MockEventSource.CONNECTING
  closed = false
  onopen: (() => void) | null = null
  onmessage: ((event: { data: string }) => void) | null = null
  onerror: (() => void) | null = null

  constructor(url: string) {
    this.url = url
    MockEventSource.instances.push(this)
  }

  close() {
    this.closed = true
    this.readyState = MockEventSource.CLOSED
  }

  /* -------------- test helpers -------------- */

  emitOpen() {
    this.readyState = MockEventSource.OPEN
    this.onopen?.()
  }

  emitMessage(payload: unknown) {
    this.onmessage?.({
      data: typeof payload === 'string' ? payload : JSON.stringify(payload),
    })
  }

  emitError(readyState: number = MockEventSource.CONNECTING) {
    this.readyState = readyState
    this.onerror?.()
  }

  static get latest() {
    return MockEventSource.instances[MockEventSource.instances.length - 1]
  }

  static reset() {
    MockEventSource.instances = []
  }
}

beforeEach(() => {
  MockEventSource.reset()
  vi.stubGlobal('EventSource', MockEventSource)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

describe('useServerSentEvents', () => {
  it('connects to the channel endpoint', () => {
    renderHook(() =>
      useServerSentEvents({
        channel: 'service-status',
      }),
    )

    expect(MockEventSource.latest.url).toBe('/api/sse?channel=service-status')
  })

  it('encodes channel names', () => {
    renderHook(() =>
      useServerSentEvents({
        channel: 'a/b c',
      }),
    )

    expect(MockEventSource.latest.url).toBe('/api/sse?channel=a%2Fb%20c')
  })

  it('starts closed and reports open once connected', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    expect(result.current.status).toBe('connecting')

    act(() => MockEventSource.latest.emitOpen())
    await waitFor(() => expect(result.current.status).toBe('open'))
  })

  it('parses JSON payloads and exposes the latest one', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents<{
        code: number
      }>({
        channel: 'test',
      }),
    )

    act(() =>
      MockEventSource.latest.emitMessage({
        code: 1,
      }),
    )
    await waitFor(() =>
      expect(result.current.data).toEqual({
        code: 1,
      }),
    )

    act(() =>
      MockEventSource.latest.emitMessage({
        code: 2,
      }),
    )
    await waitFor(() =>
      expect(result.current.data).toEqual({
        code: 2,
      }),
    )
  })

  it('invokes onMessage for each payload', async () => {
    const onMessage = vi.fn()
    renderHook(() =>
      useServerSentEvents({
        channel: 'test',
        onMessage,
      }),
    )

    act(() =>
      MockEventSource.latest.emitMessage({
        a: 1,
      }),
    )
    await waitFor(() =>
      expect(onMessage).toHaveBeenCalledWith({
        a: 1,
      }),
    )
  })

  it('reports a parse error without dropping the connection', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    act(() => MockEventSource.latest.emitMessage('not json'))

    await waitFor(() => expect(result.current.error?.message).toMatch(/Failed to parse/))
    expect(result.current.status).toBe('open')
    expect(MockEventSource.latest.closed).toBe(false)
  })

  it('reports connecting while EventSource retries after an error', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    act(() => MockEventSource.latest.emitError(MockEventSource.CONNECTING))
    await waitFor(() => expect(result.current.status).toBe('connecting'))
  })

  it('reports closed when EventSource gives up', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    act(() => MockEventSource.latest.emitError(MockEventSource.CLOSED))
    await waitFor(() => expect(result.current.status).toBe('closed'))
  })

  it('does not connect when disabled', () => {
    renderHook(() =>
      useServerSentEvents({
        channel: 'test',
        enabled: false,
      }),
    )

    expect(MockEventSource.instances).toHaveLength(0)
  })

  it('closes the connection on unmount', () => {
    const { unmount } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    const source = MockEventSource.latest
    unmount()
    expect(source.closed).toBe(true)
  })

  it('opens a new connection when the channel changes', () => {
    const { rerender } = renderHook(
      ({ channel }) =>
        useServerSentEvents({
          channel,
        }),
      {
        initialProps: {
          channel: 'first',
        },
      },
    )

    const first = MockEventSource.latest
    rerender({
      channel: 'second',
    })

    expect(first.closed).toBe(true)
    expect(MockEventSource.latest.url).toContain('second')
  })

  it('does not reconnect when only the onMessage identity changes', () => {
    const { rerender } = renderHook(
      ({ onMessage }) =>
        useServerSentEvents({
          channel: 'test',
          onMessage,
        }),
      {
        initialProps: {
          onMessage: () => undefined,
        },
      },
    )

    rerender({
      onMessage: () => undefined,
    })
    expect(MockEventSource.instances).toHaveLength(1)
  })

  it('reconnects on demand', async () => {
    const { result } = renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )

    const first = MockEventSource.latest
    act(() => result.current.reconnect())

    await waitFor(() => expect(MockEventSource.instances).toHaveLength(2))
    expect(first.closed).toBe(true)
  })

  it('reconnects when the stream goes quiet past the heartbeat window', async () => {
    vi.useFakeTimers()

    renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )
    const first = MockEventSource.latest

    // two missed heartbeats plus the checking interval
    await act(async () => {
      vi.advanceTimersByTime(30_000 * 3)
    })

    expect(first.closed).toBe(true)
    expect(MockEventSource.instances.length).toBeGreaterThan(1)
  })

  it('stays connected while messages keep arriving', async () => {
    vi.useFakeTimers()

    renderHook(() =>
      useServerSentEvents({
        channel: 'test',
      }),
    )
    const first = MockEventSource.latest

    for (let tick = 0; tick < 4; tick++) {
      await act(async () => {
        vi.advanceTimersByTime(20_000)
      })
      act(() =>
        first.emitMessage({
          tick,
        }),
      )
    }

    expect(first.closed).toBe(false)
    expect(MockEventSource.instances).toHaveLength(1)
  })
})
