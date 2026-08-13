import { describe, expect, it } from 'vitest'

import { resolveLinkTarget } from './resolveLinkTarget'

const page = {
  id: 'page-1',
  title: 'About us',
  slug: 'about-us',
}

describe('resolveLinkTarget', () => {
  it('returns the reference branch for a populated reference', () => {
    expect(
      resolveLinkTarget({
        reference: {
          relationTo: 'pages',
          value: page,
        },
      } as never),
    ).toEqual({
      relationTo: 'pages',
      value: page,
    })
  })

  it('returns the reference branch for an unpopulated id', () => {
    expect(
      resolveLinkTarget({
        reference: {
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

  it('prefers the reference when both are somehow set', () => {
    expect(
      resolveLinkTarget({
        reference: {
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
        reference: null,
        url: null,
      } as never),
    ).toBeNull()
    expect(resolveLinkTarget(null)).toBeNull()
    expect(resolveLinkTarget(undefined)).toBeNull()
  })
})
