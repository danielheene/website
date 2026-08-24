import { describe, expect, it } from 'vitest'

import { resolveLinkTypeMode } from './resolveLinkTypeMode'

describe('resolveLinkTypeMode', () => {
  it('returns the explicit linkType when it is a valid value', () => {
    expect(
      resolveLinkTypeMode({
        linkType: 'custom',
        url: undefined,
      }),
    ).toBe('custom')
    expect(
      resolveLinkTypeMode({
        linkType: 'internal',
      }),
    ).toBe('internal')
  })

  it('infers "custom" from legacy data that has a url but no linkType', () => {
    expect(
      resolveLinkTypeMode({
        url: 'https://example.com',
      }),
    ).toBe('custom')
  })

  it('prefers doc over url for legacy data that has both, matching resolveLinkTarget precedence', () => {
    expect(
      resolveLinkTypeMode({
        doc: {
          relationTo: 'pages',
          value: 'p1',
        },
        url: 'https://example.com',
      }),
    ).toBe('internal')
  })

  it('falls through to url when doc is only half-populated, matching resolveLinkTarget', () => {
    expect(
      resolveLinkTypeMode({
        doc: {
          relationTo: 'pages',
          value: null,
        },
        url: 'https://example.com',
      }),
    ).toBe('custom')
    expect(
      resolveLinkTypeMode({
        doc: {
          relationTo: undefined,
          value: 'p1',
        },
        url: 'https://example.com',
      }),
    ).toBe('custom')
  })

  it('infers "internal" from legacy data that has neither linkType nor url', () => {
    expect(resolveLinkTypeMode({})).toBe('internal')
    expect(
      resolveLinkTypeMode({
        url: '',
      }),
    ).toBe('internal')
  })

  it('ignores an invalid or unrecognized linkType value and falls back to inference', () => {
    expect(
      resolveLinkTypeMode({
        linkType: 'bogus',
        url: 'https://example.com',
      }),
    ).toBe('custom')
    expect(
      resolveLinkTypeMode({
        linkType: 'bogus',
      }),
    ).toBe('internal')
  })
})
