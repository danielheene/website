import { afterEach, describe, expect, it, vi } from 'vitest'

import robots from './robots'

const allRules = async () => {
  const { rules } = await robots()

  return Array.isArray(rules) ? rules : [rules]
}

describe('robots', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('applies one rule to every crawler', async () => {
    const rules = await allRules()

    expect(rules).toHaveLength(1)
    expect(rules[0].userAgent).toEqual(['*'])
  })

  it('lets crawlers render pages and load uploads', async () => {
    const [rule] = await allRules()

    expect(rule.allow).toEqual(['/', '/api/*/file/'])
    expect(rule.disallow).toEqual(['/admin', '/api'])
    expect(rule.disallow).not.toContain('/_next')
  })

  it('points at the sitemap and sends no Host directive', async () => {
    vi.stubEnv('SERVER_URL', 'https://example.com')
    const result = await robots()

    expect(result.sitemap).toBe('https://example.com/sitemap.xml')
    expect(result.host).toBeUndefined()
  })
})
