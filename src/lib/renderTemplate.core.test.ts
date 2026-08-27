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
      template: '{title | kebabcase}',
      data: {
        title: 'About Us',
      },
      req: req(),
    })

    expect(result).toBe('about-us')
  })

  describe('filter name resolution', () => {
    const render = (template: string, data: Record<string, string>) =>
      renderTemplateCore({
        template,
        data,
        req: req(),
      })

    it('resolves the camelCase spelling the admin help panel documents', async () => {
      const { result, error } = await render('{title | kebabCase}', {
        title: 'About Us',
      })

      expect(error).toBeNull()
      expect(result).toBe('about-us')
    })

    it('resolves camelCase and lowercase spellings identically', async () => {
      const camel = await render('{title | kebabCase}', {
        title: 'About Us',
      })
      const lower = await render('{title | kebabcase}', {
        title: 'About Us',
      })

      expect(camel.result).toBe(lower.result)
    })

    it.each([
      [
        'trimStart',
        '  spaced  ',
        'spaced  ',
      ],
      [
        'trimEnd',
        '  spaced  ',
        '  spaced',
      ],
      [
        'camelCase',
        'About Us',
        'aboutUs',
      ],
      [
        'snakeCase',
        'About Us',
        'about_us',
      ],
      [
        'kebabCase',
        'About Us',
        'about-us',
      ],
      [
        'startCase',
        'about us',
        'About Us',
      ],
      [
        'upperCase',
        'about us',
        'ABOUT US',
      ],
      [
        'upperFirst',
        'about us',
        'About us',
      ],
      [
        'lowerCase',
        'About Us',
        'about us',
      ],
      [
        'lowerFirst',
        'About Us',
        'about Us',
      ],
      [
        'toLower',
        'About US',
        'about us',
      ],
      [
        'toUpper',
        'About Us',
        'ABOUT US',
      ],
      [
        'pascalCase',
        'about us',
        'AboutUs',
      ],
    ])('resolves the documented filter %s', async (filter, input, expected) => {
      const { result, error } = await render(`{title | ${filter}}`, {
        title: input,
      })

      expect(error).toBeNull()
      expect(result).toBe(expected)
    })

    it.each([
      [
        'MM',
        '08',
      ],
      [
        'dd',
        '13',
      ],
      [
        'yyyy',
        '2026',
      ],
    ])('keeps the exact-match date filter %s working', async (filter, expected) => {
      const { result, error } = await render(`{when | ${filter}}`, {
        when: '2026-08-13',
      })

      expect(error).toBeNull()
      expect(result).toBe(expected)
    })

    it('keeps the dynamic len filter working', async () => {
      const { result, error } = await render('{title | len10}', {
        title: 'abcdefghijklmnop',
      })

      expect(error).toBeNull()
      expect(result).toBe('abcdefghij')
    })

    it('keeps the dynamic trunc filter working', async () => {
      const { result, error } = await render('{title | trunc10}', {
        title: 'abcdefghijklmnop',
      })

      expect(error).toBeNull()
      expect(result).toBe('abcdefg...')
    })

    it('keeps the Mar prefix filter working', async () => {
      const { result, error } = await render('{title | Markus}', {
        title: 'anything',
      })

      expect(error).toBeNull()
      expect(result).toBe('Markus')
    })

    it('still fails for an unknown filter', async () => {
      const { result, error } = await render('{title | definitelyNotAFilter}', {
        title: 'About Us',
      })

      expect(result).toBeNull()
      expect(error).toEqual(expect.any(String))
    })
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
