import { describe, expect, it } from 'vitest'

import { resolveLinkTarget } from './resolveLinkTarget'

const page = {
  id: 'page-1',
  title: 'About us',
  slug: 'about-us',
}

describe('resolveLinkTarget', () => {
  it('returns the doc branch for a populated doc', () => {
    expect(
      resolveLinkTarget({
        doc: {
          relationTo: 'pages',
          value: page,
        },
      } as never),
    ).toEqual({
      relationTo: 'pages',
      value: page,
    })
  })

  it('returns the doc branch for an unpopulated id', () => {
    expect(
      resolveLinkTarget({
        doc: {
          relationTo: 'posts',
          value: 'post-1',
        },
      } as never),
    ).toEqual({
      relationTo: 'posts',
      value: 'post-1',
    })
  })

  it('returns the customURL branch when only a url is set', () => {
    expect(
      resolveLinkTarget({
        url: 'https://example.com',
      } as never),
    ).toEqual({
      relationTo: 'customURL',
      value: 'https://example.com',
    })
  })

  it('trims the url', () => {
    expect(
      resolveLinkTarget({
        url: '  /contact  ',
      } as never),
    ).toEqual({
      relationTo: 'customURL',
      value: '/contact',
    })
  })

  it('prefers the doc when both are somehow set', () => {
    expect(
      resolveLinkTarget({
        doc: {
          relationTo: 'pages',
          value: page,
        },
        url: 'https://example.com',
      } as never),
    ).toEqual({
      relationTo: 'pages',
      value: page,
    })
  })

  it('returns null when neither is set', () => {
    expect(resolveLinkTarget({} as never)).toBeNull()
    expect(
      resolveLinkTarget({
        url: '   ',
      } as never),
    ).toBeNull()
    expect(
      resolveLinkTarget({
        doc: null,
        url: null,
      } as never),
    ).toBeNull()
    expect(resolveLinkTarget(null)).toBeNull()
    expect(resolveLinkTarget(undefined)).toBeNull()
  })
})
