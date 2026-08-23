import { describe, expect, it } from 'vitest'

import { resolveLinkTypeMode } from './resolveLinkTypeMode'

describe('resolveLinkTypeMode', () => {
  it('returns the explicit linkType when it is a valid value', () => {
    expect(
      resolveLinkTypeMode({
        linkType: 'url',
        url: undefined,
      }),
    ).toBe('url')
    expect(
      resolveLinkTypeMode({
        linkType: 'reference',
      }),
    ).toBe('reference')
  })

  it('infers "url" from legacy data that has a url but no linkType', () => {
    expect(
      resolveLinkTypeMode({
        url: 'https://example.com',
      }),
    ).toBe('url')
  })

  it('prefers reference over url for legacy data that has both, matching resolveLinkTarget precedence', () => {
    expect(
      resolveLinkTypeMode({
        reference: {
          relationTo: 'pages',
          value: 'p1',
        },
        url: 'https://example.com',
      }),
    ).toBe('reference')
  })

  it('infers "reference" from legacy data that has neither linkType nor url', () => {
    expect(resolveLinkTypeMode({})).toBe('reference')
    expect(
      resolveLinkTypeMode({
        url: '',
      }),
    ).toBe('reference')
  })

  it('ignores an invalid or unrecognized linkType value and falls back to inference', () => {
    expect(
      resolveLinkTypeMode({
        linkType: 'bogus',
        url: 'https://example.com',
      }),
    ).toBe('url')
    expect(
      resolveLinkTypeMode({
        linkType: 'bogus',
      }),
    ).toBe('reference')
  })
})
