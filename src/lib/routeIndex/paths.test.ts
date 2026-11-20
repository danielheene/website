import { describe, expect, it } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import { documentPath, isValidatedPath, normalizePath } from './paths'

describe('isValidatedPath', () => {
  it.each([
    '/',
    '/legal-notice',
    '/blog',
    '/blog/payload-cms',
    '/blog/post/x',
    '/resume/latest',
    '/a/b/c',
    '/404',
  ])('checks %s against the index', (path) => {
    expect(isValidatedPath(path)).toBe(true)
  })

  it.each([
    '/_next/static/chunk.js',
    '/admin',
    '/admin/collections/pages',
    '/api',
    '/api/health',
    '/robots.txt',
    '/blog/feed.xml',
    '/download/resume.pdf',
    '/favicon.ico',
    '/payload/blocks/hero-icon.svg',
  ])('lets %s through', (path) => {
    expect(isValidatedPath(path)).toBe(false)
  })

  it('only skips whole prefixes', () => {
    expect(isValidatedPath('/apis')).toBe(true)
    expect(isValidatedPath('/administration')).toBe(true)
  })
})

describe('normalizePath', () => {
  it('drops trailing slashes but keeps the root', () => {
    expect(normalizePath('/blog/')).toBe('/blog')
    expect(normalizePath('/')).toBe('/')
  })
})

describe('documentPath', () => {
  it('maps each collection to its route, home to the root', () => {
    expect(documentPath(CollectionSlug.Pages, 'home')).toBe('/')
    expect(documentPath(CollectionSlug.Pages, 'about-me')).toBe('/about-me')
    expect(documentPath(CollectionSlug.BlogTopics, 'cms')).toBe('/blog/cms')
    expect(documentPath(CollectionSlug.BlogPosts, 'hello')).toBe('/blog/post/hello')
    expect(documentPath(CollectionSlug.ResumeDocuments, 'cv-2026')).toBe('/resume/cv-2026')
  })
})
