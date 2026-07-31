import { describe, expect, it } from 'vitest'

import { generateSlug } from './generateSlug'

describe('generateSlug', () => {
  it('slugifies simple strings', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
  })

  it('transliterates umlauts', () => {
    expect(generateSlug('Über Uns')).toBe('ueber-uns')
  })

  it('does not decamelize (the whole point of the wrapper)', () => {
    expect(generateSlug('fooBarBaz')).toBe('foobarbaz')
  })

  it('handles empty strings', () => {
    expect(generateSlug('')).toBe('')
  })
})
