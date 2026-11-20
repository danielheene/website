import type { Payload } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'

import { buildRouteIndex } from './buildRouteIndex'

const payloadWith = (docs: Partial<Record<string, object[]>>) => {
  const find = vi.fn(async ({ collection }: { collection: string }) => ({
    docs: docs[collection] ?? [],
  }))

  // SAFETY: the builder only calls `find`.
  return { payload: { find } as unknown as Payload, find }
}

describe('buildRouteIndex', () => {
  it('lists every routable path with sitemap metadata', async () => {
    const { payload } = payloadWith({
      [CollectionSlug.Pages]: [
        { slug: 'home', updatedAt: '2026-01-01T00:00:00.000Z' },
        { slug: 'about-me', updatedAt: '2026-01-02T00:00:00.000Z' },
      ],
      [CollectionSlug.BlogPosts]: [
        { slug: 'hello', updatedAt: '2026-03-01T00:00:00.000Z', topics: [{ value: 't1' }] },
      ],
      [CollectionSlug.BlogTopics]: [
        { id: 't1', slug: 'cms', updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 't2', slug: 'empty', updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: 't3', slug: 'post', updatedAt: '2026-01-01T00:00:00.000Z' },
      ],
      [CollectionSlug.ResumeDocuments]: [
        { slug: 'cv-1', createdAt: '2026-02-01T00:00:00.000Z' },
        { slug: 'cv-2', createdAt: '2026-04-01T00:00:00.000Z' },
      ],
    })

    const index = await buildRouteIndex(payload)

    expect(index).toEqual({
      '/': { indexable: true, lastModified: '2026-01-01T00:00:00.000Z' },
      '/about-me': { indexable: true, lastModified: '2026-01-02T00:00:00.000Z' },
      '/blog': { indexable: true, lastModified: '2026-03-01T00:00:00.000Z' },
      '/blog/post/hello': { indexable: true, lastModified: '2026-03-01T00:00:00.000Z' },
      '/blog/cms': { indexable: true, lastModified: '2026-03-01T00:00:00.000Z' },
      '/blog/empty': { indexable: false, lastModified: '2026-01-01T00:00:00.000Z' },
      '/resume/cv-1': { indexable: true, lastModified: '2026-02-01T00:00:00.000Z' },
      '/resume/cv-2': { indexable: true, lastModified: '2026-04-01T00:00:00.000Z' },
      '/resume/latest': { indexable: true, lastModified: '2026-04-01T00:00:00.000Z' },
      '/resume/validate': { indexable: true },
    })
  })

  it('only lists published pages, topics and posts', async () => {
    const { payload, find } = payloadWith({})

    await buildRouteIndex(payload)

    for (const collection of [
      CollectionSlug.Pages,
      CollectionSlug.BlogPosts,
      CollectionSlug.BlogTopics,
    ]) {
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({ collection, where: { _status: { equals: 'published' } } }),
      )
    }
  })

  it('leaves out /resume/latest without résumé documents', async () => {
    const { payload } = payloadWith({})

    const index = await buildRouteIndex(payload)

    expect(index).not.toHaveProperty('/resume/latest')
    expect(index).toHaveProperty('/blog')
  })
})
