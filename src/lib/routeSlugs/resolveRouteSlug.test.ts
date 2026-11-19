import { describe, expect, it } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import { isReservedSlug, isVirtualSlug, resolveRouteSlug } from './resolveRouteSlug'

describe('resolveRouteSlug', () => {
  it.each([
    ['/legal-notice', CollectionSlug.Pages, 'legal-notice'],
    ['/legal-notice/', CollectionSlug.Pages, 'legal-notice'],
    ['/blog/payload-cms', CollectionSlug.BlogTopics, 'payload-cms'],
    ['/blog/post', CollectionSlug.BlogTopics, 'post'],
    ['/blog/post/hello-world', CollectionSlug.BlogPosts, 'hello-world'],
    ['/resume/latest', CollectionSlug.ResumeDocuments, 'latest'],
  ])('maps %s to its document', (pathname, collection, slug) => {
    expect(resolveRouteSlug(pathname)).toEqual({ collection, slug })
  })

  it.each([
    '/',
    '/blog',
    '/resume',
    '/404',
    '/admin',
    '/api',
    '/api/health',
    '/admin/collections/pages',
    '/blog/feed.xml',
    '/robots.txt',
    '/llms.txt',
    '/download/resume.pdf',
    '/_next/static/chunk.js',
    '/blog/post/hello/extra',
    '/a/b',
    '/a/b/c',
  ])('leaves %s to its own route', (pathname) => {
    expect(resolveRouteSlug(pathname)).toBeNull()
  })
})

describe('slug classes', () => {
  it('treats /resume/latest as served without a document of that name', () => {
    expect(isVirtualSlug({ collection: CollectionSlug.ResumeDocuments, slug: 'latest' })).toBe(true)
    expect(isVirtualSlug({ collection: CollectionSlug.Pages, slug: 'latest' })).toBe(false)
  })

  it('rejects the reserved topic slugs', () => {
    expect(isReservedSlug({ collection: CollectionSlug.BlogTopics, slug: 'post' })).toBe(true)
    expect(isReservedSlug({ collection: CollectionSlug.Pages, slug: 'post' })).toBe(false)
  })
})
