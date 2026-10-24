import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { sendUmamiPayload } from './sendUmamiPayload'
import { track, trackPageview } from './track'

vi.mock('./sendUmamiPayload', () => ({
  sendUmamiPayload: vi.fn().mockResolvedValue(undefined),
}))

const SITE_ID = 'site-abc'

describe('track', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', SITE_ID)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('in a browser context', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '?bar=baz',
        hostname: 'example.com',
      })
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Foo Page',
        referrer: 'https://referrer.example.com',
      })
    })

    it('sends a pageview payload with browser fields when called bare', () => {
      track()

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
      expect(sendUmamiPayload).toHaveBeenCalledWith({
        type: 'event',
        payload: {
          website: SITE_ID,
          url: '/foo?bar=baz',
          hostname: 'example.com',
          language: 'en-US',
          screen: '1920x1080',
          title: 'Foo Page',
          referrer: 'https://referrer.example.com',
        },
      })
    })

    it('sets payload.name when called with a string', () => {
      track('my-event')

      expect(sendUmamiPayload).toHaveBeenCalledWith(
        expect.objectContaining({
          payload: expect.objectContaining({
            name: 'my-event',
          }),
        }),
      )
      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.data).toBeUndefined()
    })

    it('sets payload.data with no name when called with an object', () => {
      track({
        foo: 'bar',
      })

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.name).toBeUndefined()
      expect(sentPayload.payload.data).toEqual({
        foo: 'bar',
      })
    })

    it('sets both name and data when called with a string and object', () => {
      track('my-event', {
        foo: 'bar',
      })

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.name).toBe('my-event')
      expect(sentPayload.payload.data).toEqual({
        foo: 'bar',
      })
    })

    it('invokes a callback function and uses its return value as data', () => {
      const fn = vi.fn().mockImplementation((data: Record<string, unknown>) => ({
        ...data,
        added: true,
      }))

      track(fn)

      expect(fn).toHaveBeenCalledWith({})
      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.data).toEqual({
        added: true,
      })
    })

    it('omits referrer when document.referrer is empty', () => {
      vi.stubGlobal('document', {
        title: 'Foo Page',
        referrer: '',
      })

      track()

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.referrer).toBeUndefined()
    })
  })

  describe('outside a browser context (no window)', () => {
    it('does not throw and sends a minimal payload', () => {
      expect(() =>
        track('server-event', {
          foo: 'bar',
        }),
      ).not.toThrow()

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload).toEqual({
        type: 'event',
        payload: {
          website: SITE_ID,
          name: 'server-event',
          data: {
            foo: 'bar',
          },
        },
      })
    })

    it('does not throw when called bare', () => {
      expect(() => track()).not.toThrow()

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload).toEqual({
        type: 'event',
        payload: {
          website: SITE_ID,
        },
      })
    })
  })

  describe('window.__UMAMI_SUPPRESSED__ flag', () => {
    beforeEach(() => {
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '?bar=baz',
        hostname: 'example.com',
      })
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Foo Page',
        referrer: '',
      })
    })

    it('does not send when window.__UMAMI_SUPPRESSED__ is true', () => {
      vi.stubGlobal('window', {
        __UMAMI_SUPPRESSED__: true,
      })

      track()

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('sends when window.__UMAMI_SUPPRESSED__ is false', () => {
      vi.stubGlobal('window', {
        __UMAMI_SUPPRESSED__: false,
      })

      track()

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
    })

    it('sends when window.__UMAMI_SUPPRESSED__ is unset', () => {
      vi.stubGlobal('window', {})

      track()

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
    })
  })

  describe('admin path exclusion', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Admin',
        referrer: '',
      })
    })

    it('does not send when the current location is /admin', () => {
      vi.stubGlobal('location', {
        pathname: '/admin',
        search: '',
        hostname: 'example.com',
      })

      track()

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('does not send when the current location is nested under /admin', () => {
      vi.stubGlobal('location', {
        pathname: '/admin/collections/pages',
        search: '',
        hostname: 'example.com',
      })

      track()

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('still sends for a path that merely starts with "/admin" as a different segment', () => {
      vi.stubGlobal('location', {
        pathname: '/administration',
        search: '',
        hostname: 'example.com',
      })

      track()

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
    })
  })
})

describe('trackPageview', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SITE_ID', SITE_ID)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.clearAllMocks()
  })

  describe('in a browser context', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('location', {
        pathname: '/previous/path',
        search: '?bar=baz',
        hostname: 'example.com',
      })
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Foo Page',
        referrer: 'https://referrer.example.com',
      })
    })

    it('uses the explicit url argument instead of the current location', () => {
      trackPageview('/destination/path')

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.url).toBe('/destination/path')
      expect(sentPayload.payload.url).not.toBe('/previous/path?bar=baz')
      expect(sentPayload.payload).toMatchObject({
        website: SITE_ID,
        url: '/destination/path',
        hostname: 'example.com',
        language: 'en-US',
        screen: '1920x1080',
        title: 'Foo Page',
        referrer: 'https://referrer.example.com',
      })
    })

    it('falls back to location.pathname + location.search when no url is given', () => {
      trackPageview()

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload.payload.url).toBe('/previous/path?bar=baz')
    })
  })

  describe('outside a browser context (no window)', () => {
    it('does not throw and omits the url field when called bare', () => {
      expect(() => trackPageview()).not.toThrow()

      const [[sentPayload]] = vi.mocked(sendUmamiPayload).mock.calls
      expect(sentPayload).toEqual({
        type: 'event',
        payload: {
          website: SITE_ID,
        },
      })
    })
  })

  describe('suppression/allow gating', () => {
    beforeEach(() => {
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '?bar=baz',
        hostname: 'example.com',
      })
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Foo Page',
        referrer: '',
      })
    })

    it('does not send when window.__UMAMI_SUPPRESSED__ is true', () => {
      vi.stubGlobal('window', {
        __UMAMI_SUPPRESSED__: true,
      })

      trackPageview('/destination/path')

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('sends when not suppressed', () => {
      vi.stubGlobal('window', {})

      trackPageview('/destination/path')

      expect(sendUmamiPayload).toHaveBeenCalledTimes(1)
    })
  })

  describe('admin path exclusion', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {})
      vi.stubGlobal('navigator', {
        language: 'en-US',
      })
      vi.stubGlobal('screen', {
        width: 1920,
        height: 1080,
      })
      vi.stubGlobal('document', {
        title: 'Admin',
        referrer: '',
      })
    })

    it('does not send when the explicit url targets /admin', () => {
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '',
        hostname: 'example.com',
      })

      trackPageview('/admin')

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('does not send when the explicit url targets a nested /admin path', () => {
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '',
        hostname: 'example.com',
      })

      trackPageview('/admin/collections/pages')

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('does not send when called bare on the /admin location (first page load)', () => {
      vi.stubGlobal('location', {
        pathname: '/admin',
        search: '',
        hostname: 'example.com',
      })

      trackPageview()

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })

    it('does not send when the explicit url is an absolute /admin URL', () => {
      vi.stubGlobal('location', {
        pathname: '/foo',
        search: '',
        hostname: 'example.com',
        origin: 'https://example.com',
      })

      trackPageview('https://example.com/admin/login')

      expect(sendUmamiPayload).not.toHaveBeenCalled()
    })
  })
})
