import { describe, expect, it } from 'vitest'

import { siblingPath } from './siblingPath'

describe('siblingPath', () => {
  it('swaps the last segment of a deeply nested path', () => {
    expect(siblingPath('layout.0.links.entries.2.link.reference', 'url')).toBe(
      'layout.0.links.entries.2.link.url',
    )
  })

  it('swaps the last segment of a shallow group path', () => {
    expect(siblingPath('link.reference', 'url')).toBe('link.url')
  })

  it('handles a single-segment path, as used in the lexical link drawer', () => {
    expect(siblingPath('reference', 'url')).toBe('url')
  })

  it('leaves earlier segments that share the name untouched', () => {
    expect(siblingPath('url.0.link.reference', 'url')).toBe('url.0.link.url')
  })
})
