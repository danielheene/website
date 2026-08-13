import { describe, expect, it } from 'vitest'

import { deriveLinkTitle } from './deriveLinkTitle'

describe('deriveLinkTitle', () => {
  it('uses the title of a populated reference', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'pages',
        value: {
          id: 'page-1',
          title: 'About us',
          slug: 'about-us',
        } as never,
      }),
    ).toBe('About us')
  })

  it('returns an empty string for an unpopulated reference', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'pages',
        value: 'page-1',
      }),
    ).toBe('')
  })

  it('uses the hostname of an absolute custom URL', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: 'https://github.com/danielheene/website',
      }),
    ).toBe('github.com')
  })

  it('falls back to the raw string when there is no hostname', () => {
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: '/contact',
      }),
    ).toBe('/contact')
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: '#top',
      }),
    ).toBe('#top')
    expect(
      deriveLinkTitle({
        relationTo: 'customURL',
        value: 'mailto:hello@example.com',
      }),
    ).toBe('mailto:hello@example.com')
  })

  it('returns an empty string for no target', () => {
    expect(deriveLinkTitle(null)).toBe('')
  })
})
