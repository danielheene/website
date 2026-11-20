import type { PayloadRequest } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { addRoute, removeRoute } from '@/lib/routeIndex/routeIndexStore'
import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

import { routeIndexHooks } from './routeIndexHooks'

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/routeIndex/routeIndexStore', () => ({
  addRoute: vi.fn(),
  removeRoute: vi.fn(),
}))

const request = (live: object | undefined) => {
  const find = vi.fn().mockResolvedValue({ docs: live ? [live] : [] })
  const queue = vi.fn()

  // SAFETY: the hooks only use `payload.find`, `payload.jobs.queue` and `payload.logger`.
  const req = {
    payload: { find, jobs: { queue }, logger: { error: vi.fn() } },
  } as unknown as PayloadRequest

  return { req, find, queue }
}

// SAFETY: the hooks only read `doc` and `req` from their arguments.
const change = (hook: unknown, doc: object, req: PayloadRequest) =>
  (hook as (args: object) => Promise<unknown>)({ doc, req })

beforeEach(() => {
  vi.clearAllMocks()
})

describe('routeIndexHooks', () => {
  const pages = routeIndexHooks(CollectionSlug.Pages)

  it('adds the live path of a published document and queues a rebuild', async () => {
    const { req, queue } = request({ id: 1, slug: 'about-me', _status: 'published' })

    await change(pages.afterChange, { id: 1, slug: 'about-me', _status: 'published' }, req)

    expect(addRoute).toHaveBeenCalledWith('/about-me', { indexable: true })
    expect(removeRoute).not.toHaveBeenCalled()
    expect(queue).toHaveBeenCalledWith(expect.objectContaining({ task: TaskSlug.BuildRouteIndex }))
  })

  it('keeps a published page reachable while a draft of it is saved', async () => {
    const { req } = request({ id: 1, slug: 'about-me', _status: 'published' })

    await change(pages.afterChange, { id: 1, slug: 'about-me-v2', _status: 'draft' }, req)

    expect(addRoute).toHaveBeenCalledWith('/about-me', { indexable: true })
    expect(removeRoute).not.toHaveBeenCalled()
  })

  it('removes the path of an unpublished or trashed document', async () => {
    const unpublished = request({ id: 1, slug: 'about-me', _status: 'draft' })

    await change(pages.afterChange, { id: 1, slug: 'about-me', _status: 'draft' }, unpublished.req)

    const trashed = request(undefined)

    await change(pages.afterChange, { id: 2, slug: 'old', _status: 'published' }, trashed.req)

    expect(removeRoute).toHaveBeenNthCalledWith(1, '/about-me')
    expect(removeRoute).toHaveBeenNthCalledWith(2, '/old')
    expect(addRoute).not.toHaveBeenCalled()
  })

  it('adds /resume/latest with a résumé document, which has no drafts', async () => {
    const { req } = request({ id: 1, slug: 'cv-2026' })

    await change(routeIndexHooks(CollectionSlug.ResumeDocuments).afterChange, { id: 1 }, req)

    expect(addRoute).toHaveBeenCalledWith('/resume/cv-2026', { indexable: true })
    expect(addRoute).toHaveBeenCalledWith('/resume/latest', { indexable: true })
  })

  it('removes the path of a deleted document and queues a rebuild', async () => {
    const { req, queue } = request(undefined)

    await change(
      routeIndexHooks(CollectionSlug.BlogPosts).afterDelete,
      { id: 1, slug: 'hello' },
      req,
    )

    expect(removeRoute).toHaveBeenCalledWith('/blog/post/hello')
    expect(queue).toHaveBeenCalled()
  })

  it('never fails the save', async () => {
    const { req } = request({ id: 1, slug: 'about-me', _status: 'published' })

    vi.mocked(addRoute).mockRejectedValueOnce(new Error('redis down'))

    const doc = { id: 1, slug: 'about-me', _status: 'published' }

    await expect(change(pages.afterChange, doc, req)).resolves.toBe(doc)
  })
})
