import { afterEach, describe, expect, it, vi } from 'vitest'

import robots from './robots'

const rulesFor = async (agent: string) => {
  const { rules } = await robots()
  return (Array.isArray(rules) ? rules : [rules]).find(({ userAgent }) =>
    Array.isArray(userAgent) ? userAgent.includes(agent) : userAgent === agent,
  )
}

describe('robots', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('lets search engines render pages and load uploads', async () => {
    const rule = await rulesFor('Googlebot')

    expect(rule.allow).toEqual(expect.arrayContaining(['/', '/api/*/file/']))
    expect(rule.disallow).toEqual(expect.arrayContaining(['/admin', '/api']))
    expect(rule.disallow).not.toContain('/_next')
  })

  it('gives link-preview bots the same access as search engines', async () => {
    expect(await rulesFor('Twitterbot')).toEqual(await rulesFor('Googlebot'))
  })

  it('limits every other crawler to /llms.txt', async () => {
    const rule = await rulesFor('*')

    expect(rule.allow).toEqual(['/llms.txt'])
    expect(rule.disallow).toEqual(['/'])
  })

  it('points at the sitemap and sends no Host directive', async () => {
    vi.stubEnv('SERVER_URL', 'https://example.com')
    const result = await robots()

    expect(result.sitemap).toBe('https://example.com/sitemap.xml')
    expect(result.host).toBeUndefined()
  })
})
