import { describe, expect, it } from 'vitest'

import { generateContentPath } from './generateContentPath'

describe('generateContentPath', () => {
  it('builds page paths without a prefix', () => {
    expect(generateContentPath('pages', 'about')).toBe('/about')
  })

  it('resolves the home page to the root path', () => {
    expect(generateContentPath('pages', 'home')).toBe('/')
  })

  it('prefixes blog post paths', () => {
    expect(generateContentPath('posts', 'my-post')).toBe('/posts/my-post')
  })

  it('prefixes blog topic paths', () => {
    expect(generateContentPath('topics', 'devops')).toBe('/blog/devops')
  })

  it('prefixes resume document paths', () => {
    expect(generateContentPath('resume-documents', 'cv')).toBe('/resume/cv')
  })

  it('defaults the slug to an empty string', () => {
    expect(generateContentPath('posts')).toBe('/posts/')
  })

  it('produces "/undefined/..." for unknown collections (documents current behavior)', () => {
    expect(generateContentPath('nope', 'slug')).toBe('/undefined/slug')
  })
})
