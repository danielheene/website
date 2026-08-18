import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendUmamiPayload } from './sendUmamiPayload'

const UMAMI_URL = 'https://umami.example.com'

describe('sendUmamiPayload', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_URL', UMAMI_URL)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('in a browser context', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {})
    })

    it('sends via navigator.sendBeacon when available', async () => {
      const sendBeacon = vi.fn().mockReturnValue(true)
      vi.stubGlobal('navigator', {
        sendBeacon,
      })
      const fetchMock = vi.fn()
      vi.stubGlobal('fetch', fetchMock)

      await sendUmamiPayload({
        payload: {
          website: 'abc',
        },
        type: 'event',
      })

      expect(sendBeacon).toHaveBeenCalledTimes(1)
      expect(sendBeacon).toHaveBeenCalledWith(`${UMAMI_URL}/api/send`, expect.any(Blob))
      expect(fetchMock).not.toHaveBeenCalled()
    })

    it('falls back to fetch with keepalive when sendBeacon is unavailable', async () => {
      vi.stubGlobal('navigator', {})
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
      vi.stubGlobal('fetch', fetchMock)

      await sendUmamiPayload({
        payload: {
          website: 'abc',
        },
        type: 'event',
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(`${UMAMI_URL}/api/send`)
      expect(init).toMatchObject({
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: {
            website: 'abc',
          },
          type: 'event',
        }),
      })
    })

    it('falls back to fetch with keepalive when the payload exceeds the beacon size limit', async () => {
      const sendBeacon = vi.fn().mockReturnValue(true)
      vi.stubGlobal('navigator', {
        sendBeacon,
      })
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
      vi.stubGlobal('fetch', fetchMock)

      const largeValue = 'a'.repeat(70_000)

      await sendUmamiPayload({
        payload: {
          website: largeValue,
        },
        type: 'event',
      })

      expect(sendBeacon).not.toHaveBeenCalled()
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(`${UMAMI_URL}/api/send`)
      expect(init).toMatchObject({
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('never throws when sendBeacon returns false', async () => {
      const sendBeacon = vi.fn().mockReturnValue(false)
      vi.stubGlobal('navigator', {
        sendBeacon,
      })
      vi.stubGlobal('fetch', vi.fn())

      await expect(
        sendUmamiPayload({
          payload: {},
          type: 'event',
        }),
      ).resolves.toBeUndefined()
    })
  })

  describe('in a server context (no window)', () => {
    it('always uses fetch', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
      })
      vi.stubGlobal('fetch', fetchMock)

      await sendUmamiPayload({
        payload: {
          website: 'abc',
        },
        type: 'event',
      })

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [url, init] = fetchMock.mock.calls[0]
      expect(url).toBe(`${UMAMI_URL}/api/send`)
      expect(init).toMatchObject({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: {
            website: 'abc',
          },
          type: 'event',
        }),
      })
    })

    it('never rejects when fetch rejects', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

      await expect(
        sendUmamiPayload({
          payload: {},
          type: 'event',
        }),
      ).resolves.toBeUndefined()
    })

    it('never rejects when fetch resolves with a non-2xx status', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          status: 500,
        }),
      )

      await expect(
        sendUmamiPayload({
          payload: {},
          type: 'event',
        }),
      ).resolves.toBeUndefined()
    })
  })
})
