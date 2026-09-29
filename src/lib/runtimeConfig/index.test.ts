import { afterEach, describe, expect, it, vi } from 'vitest'

import { getRuntimeConfig, readRuntimeConfigFromEnv, serializeRuntimeConfig } from './index'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('runtime config', () => {
  it('reads the environment on the server and maps empty values to undefined', () => {
    vi.stubEnv('SERVER_URL', 'https://example.test')
    vi.stubEnv('SENTRY_DSN', '')

    expect(readRuntimeConfigFromEnv()).toMatchObject({
      serverUrl: 'https://example.test',
      sentryDsn: undefined,
    })
    expect(getRuntimeConfig().serverUrl).toBe('https://example.test')
  })

  it('reads the server-rendered value in the browser and ignores the environment', () => {
    vi.stubEnv('SERVER_URL', 'https://from-env.test')
    vi.stubGlobal('window', {
      __RUNTIME_CONFIG__: {
        serverUrl: 'https://from-page.test',
      },
    })

    expect(getRuntimeConfig()).toEqual({
      serverUrl: 'https://from-page.test',
    })
  })

  it('falls back to an empty config in the browser before the script ran', () => {
    vi.stubGlobal('window', {})
    expect(getRuntimeConfig()).toEqual({})
  })

  it('escapes markup so the JSON cannot close the script tag', () => {
    const json = serializeRuntimeConfig({
      statusPageUrl: '</script><script>alert(1)</script>',
    })

    expect(json).not.toContain('</script>')
    expect(JSON.parse(json).statusPageUrl).toBe('</script><script>alert(1)</script>')
  })
})
