import { describe, expect, it } from 'vitest'

import { isValidCustomURL } from './isValidCustomURL'

describe('isValidCustomURL', () => {
  it.each([
    'https://example.com',
    'https://example.com/a/b?c=d#e',
    'http://example.com',
    'mailto:hello@example.com',
    'tel:+4915112345678',
    '/contact',
    '/',
    '#section',
  ])('accepts %s', (value) => {
    expect(isValidCustomURL(value)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>',
    'ftp://example.com',
    '//evil.example.com',
    'example.com',
    'not a url',
    '',
    '   ',
  ])('rejects %s', (value) => {
    expect(isValidCustomURL(value)).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isValidCustomURL(undefined)).toBe(false)
    expect(isValidCustomURL(null)).toBe(false)
    expect(isValidCustomURL(42)).toBe(false)
  })

  it('ignores surrounding whitespace', () => {
    expect(isValidCustomURL('  https://example.com  ')).toBe(true)
  })
})
