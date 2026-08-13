/**
 * `payload` is globally mocked in vitest.setup.ts with a stub that lacks
 * `getAPIURL`/`getAdminURL`/`config.serverURL`. The req-absent path calls
 * `getPayload` directly, so that one test overrides its resolved value with
 * the same stub the other tests inject via `req.payload`.
 */
import { getPayload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The core module imports `@payload-config` at the top level; the real config
 * builds a Redis KV adapter and throws without REDIS_URL. Same stub as the
 * other action tests use.
 */
vi.mock('@payload-config', () => ({
  default: {},
}))

const fetchSiteSettings = vi.fn()
const fetchGlobalUserSettings = vi.fn()

vi.mock('@/lib/fetchers', () => ({
  fetchSiteSettings: (locale: string) => fetchSiteSettings(locale),
  fetchGlobalUserSettings: (locale: string) => fetchGlobalUserSettings(locale),
}))

const payloadStub = {
  config: {
    serverURL: 'http://localhost:3000',
  },
  getAPIURL: () => 'http://localhost:3000/api',
  getAdminURL: () => 'http://localhost:3000/admin',
}

import { renderTemplateCore } from './renderTemplate.core'

beforeEach(() => {
  fetchSiteSettings.mockResolvedValue({
    general: {
      siteName: 'Daniel Heene',
      siteURL: 'http://localhost:3000',
      siteHost: 'localhost',
    },
  })
  fetchGlobalUserSettings.mockResolvedValue({
    firstName: 'Daniel',
    lastName: 'Heene',
    name: 'Daniel Heene',
  })
})

const req = () =>
  ({
    context: {},
    payload: payloadStub,
  }) as never

describe('renderTemplateCore', () => {
  it('renders a caller-supplied variable', async () => {
    const { result, error } = await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'About us',
      },
      req: req(),
    })

    expect(error).toBeNull()
    expect(result).toBe('About us')
  })

  it('renders global variables alongside caller data', async () => {
    const { result } = await renderTemplateCore({
      template: '{title} — {siteName}',
      data: {
        title: 'About us',
      },
      req: req(),
    })

    expect(result).toBe('About us — Daniel Heene')
  })

  it('applies filters', async () => {
    const { result } = await renderTemplateCore({
      // Filter keys are registered lowercase and pupa looks them up
      // case-sensitively, so `kebabcase` is the real spelling.
      template: '{title | kebabcase}',
      data: {
        title: 'About Us',
      },
      req: req(),
    })

    expect(result).toBe('about-us')
  })

  it('returns an error for an unresolvable variable', async () => {
    const { result, error } = await renderTemplateCore({
      template: '{nope}',
      data: {},
      req: req(),
    })

    expect(result).toBeNull()
    expect(error).toEqual(expect.any(String))
  })

  it('fetches globals once per request when a req is supplied', async () => {
    const sharedReq = req()

    await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'a',
      },
      req: sharedReq,
    })
    await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'b',
      },
      req: sharedReq,
    })
    await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'c',
      },
      req: sharedReq,
    })

    expect(fetchSiteSettings).toHaveBeenCalledTimes(1)
    expect(fetchGlobalUserSettings).toHaveBeenCalledTimes(1)
  })

  it('shares a single in-flight fetch across concurrent calls with the same req', async () => {
    const sharedReq = req()

    await Promise.all([
      renderTemplateCore({
        template: '{title}',
        data: {
          title: 'a',
        },
        req: sharedReq,
      }),
      renderTemplateCore({
        template: '{title}',
        data: {
          title: 'b',
        },
        req: sharedReq,
      }),
      renderTemplateCore({
        template: '{title}',
        data: {
          title: 'c',
        },
        req: sharedReq,
      }),
    ])

    expect(fetchSiteSettings).toHaveBeenCalledTimes(1)
    expect(fetchGlobalUserSettings).toHaveBeenCalledTimes(1)
  })

  it('renders correctly when no req is supplied', async () => {
    vi.mocked(getPayload).mockResolvedValueOnce(payloadStub as never)

    const { result, error } = await renderTemplateCore({
      template: '{title} — {siteName}',
      data: {
        title: 'About us',
      },
    })

    expect(error).toBeNull()
    expect(result).toBe('About us — Daniel Heene')
  })

  it('keys the per-request cache by locale', async () => {
    const sharedReq = req()

    await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'a',
      },
      req: sharedReq,
    })
    await renderTemplateCore({
      template: '{title}',
      data: {
        title: 'a',
      },
      locale: 'de',
      req: sharedReq,
    })

    expect(fetchSiteSettings).toHaveBeenCalledTimes(2)
    expect(fetchSiteSettings).toHaveBeenNthCalledWith(1, 'en')
    expect(fetchSiteSettings).toHaveBeenNthCalledWith(2, 'de')
  })
})
