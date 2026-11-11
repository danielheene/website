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

  describe('on production', () => {
    const stubProduction = () => {
      vi.stubEnv('SERVER_HOST', 'daniel.heene.io')
      vi.stubEnv('SERVER_URL', 'https://daniel.heene.io')
    }

    it('applies one rule to every crawler', async () => {
      stubProduction()
      const rules = await allRules()

      expect(rules).toHaveLength(1)
      expect(rules[0].userAgent).toEqual(['*'])
    })

    it('lets crawlers render pages and load uploads', async () => {
      stubProduction()
      const [rule] = await allRules()

      expect(rule.allow).toEqual(['/', '/api/*/file/'])
      expect(rule.disallow).toEqual(['/admin', '/api'])
      expect(rule.disallow).not.toContain('/_next')
    })

    it('points at the sitemap and sends no Host directive', async () => {
      stubProduction()
      const result = await robots()

      expect(result.sitemap).toBe('https://daniel.heene.io/sitemap.xml')
      expect(result.host).toBeUndefined()
    })
  })

  describe('everywhere else', () => {
    it.each(['daniel.heene.dev', 'localhost:3000', 'staging.daniel.heene.io'])(
      'disallows everything on %s',
      async (host) => {
        vi.stubEnv('SERVER_HOST', host)
        vi.stubEnv('SERVER_URL', `https://${host}`)
        const result = await robots()

        expect(await allRules()).toEqual([
          {
            userAgent: ['*'],
            disallow: ['/'],
          },
        ])
        expect(result.sitemap).toBeUndefined()
      },
    )

    it('disallows everything when SERVER_HOST is unset', async () => {
      vi.stubEnv('SERVER_HOST', undefined)

      expect((await allRules())[0].disallow).toEqual(['/'])
    })
  })
})
