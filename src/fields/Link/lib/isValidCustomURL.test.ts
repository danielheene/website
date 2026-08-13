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
    '/a/b?c=d#e',
    '#section',
  ])('accepts %j', (value) => {
    expect(isValidCustomURL(value)).toBe(true)
  })

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>',
    'ftp://example.com',
    'example.com',
    'not a url',
    '',
    '   ',
  ])('rejects %j', (value) => {
    expect(isValidCustomURL(value)).toBe(false)
  })

  /**
   * Values that look same-origin as written but that the WHATWG URL parser
   * resolves onto a foreign host. Each of these produced `https://evil.com/`
   * when resolved against a site origin.
   */
  it.each([
    '//evil.example.com',
    '///evil.com',
    '/\\evil.com',
    '/\\/evil.com',
    '\\\\evil.com',
    '/\t/evil.com',
    '/\n/evil.com',
    '/\r/evil.com',
    '/\t//evil.com',
    '//\tevil.com',
    '/\t\\evil.com',
    '/\\\t/evil.com',
    '  /\\evil.com  ',
    '\t/\t/evil.com\n',
  ])('rejects %j because it resolves to a foreign origin', (value) => {
    expect(isValidCustomURL(value)).toBe(false)
  })

  /**
   * The mirror image: values that contain characters a blocklist would flag,
   * but which the parser keeps on our own origin. They are ordinary paths and
   * fragments, so they are accepted.
   */
  it.each([
    '/path\\to\\evil.com', // backslashes normalize to path separators
    '/%5Cevil.com', // percent-encoded backslash stays a literal path byte
    '/%09/evil.com', // percent-encoded tab stays a literal path byte
    '/%2F%2Fevil.com', // percent-encoded slashes never become a host
    '/@evil.com', // no authority section, so no userinfo
    '/..//evil.com', // dot-segment removal keeps the path on-origin
    '/ /evil.com', // space is percent-encoded into the path
    '#//evil.com', // a fragment can never change the origin
    '#\\evil.com',
  ])('accepts %j because it resolves back onto our own origin', (value) => {
    expect(isValidCustomURL(value)).toBe(true)
  })

  /**
   * The protocol allowlist is applied to the parsed protocol, so schemes
   * obfuscated with the same characters the parser strips are normalized back
   * to their real scheme before the check runs.
   */
  it.each([
    'java\tscript:alert(1)',
    'java\nscript:alert(1)',
    'java\rscript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'vbscript:msgbox(1)',
    'blob:https://example.com/x',
    'file:///etc/passwd',
    'about:blank',
  ])('rejects the disallowed scheme %j', (value) => {
    expect(isValidCustomURL(value)).toBe(false)
  })

  it('rejects non-string input', () => {
    expect(isValidCustomURL(undefined)).toBe(false)
    expect(isValidCustomURL(null)).toBe(false)
    expect(isValidCustomURL(42)).toBe(false)
  })

  it('ignores surrounding whitespace', () => {
    expect(isValidCustomURL('  https://example.com  ')).toBe(true)
    expect(isValidCustomURL('\t/contact\n')).toBe(true)
  })
})
