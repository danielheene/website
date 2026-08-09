import { describe, expect, it } from 'vitest'

import { normalizeFromPath, normalizeRedirectPath } from './normalizeFromPath'

describe('normalizeRedirectPath', () => {
  it('adds a leading slash', () => {
    expect(normalizeRedirectPath('old-page')).toBe('/old-page')
  })

  it('strips trailing slashes', () => {
    expect(normalizeRedirectPath('/old-page/')).toBe('/old-page')
    expect(normalizeRedirectPath('/old-page///')).toBe('/old-page')
  })

  it('preserves the root path', () => {
    expect(normalizeRedirectPath('/')).toBe('/')
    expect(normalizeRedirectPath('')).toBe('/')
  })

  it('drops query strings and hashes', () => {
    expect(normalizeRedirectPath('/old?utm_source=x')).toBe('/old')
    expect(normalizeRedirectPath('/old#section')).toBe('/old')
  })

  it('strips an origin', () => {
    expect(normalizeRedirectPath('https://example.test/old-page')).toBe('/old-page')
  })

  it('lowercases and trims', () => {
    expect(normalizeRedirectPath('  /Old-Page  ')).toBe('/old-page')
  })
})

describe('normalizeFromPath hook', () => {
  const run = (data: Record<string, unknown>) =>
    normalizeFromPath({
      data,
    } as never) as Record<string, unknown>

  it('normalizes the from path', () => {
    expect(
      run({
        from: 'Old-Page/',
      }).from,
    ).toBe('/old-page')
  })

  it('normalizes an internal target path', () => {
    expect(
      run({
        from: '/a',
        toPath: 'New-Page/',
      }).toPath,
    ).toBe('/new-page')
  })

  it('leaves absolute target URLs untouched', () => {
    expect(
      run({
        from: '/a',
        toPath: 'https://Example.test/Path',
      }).toPath,
    ).toBe('https://Example.test/Path')
  })

  it('ignores missing fields', () => {
    expect(run({}).from).toBeUndefined()
  })
})
