import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'
import { TaskSlug } from '@/types/jobs-queue'

import { enqueueGenerateMeta } from './enqueueGenerateMeta'

const text = (value: string) => ({
  root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: value }] }] },
})

const run = async (
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> = {},
  context: Record<string, unknown> = {},
) => {
  const queue = vi.fn(async (_args: { input: { steps: string[] } }) => ({ id: 'job-1' }))
  // queued steps never merge with a pending job in these tests
  const find = vi.fn(async () => ({ docs: [] }))

  await enqueueGenerateMeta(CollectionSlug.BlogPosts)({
    // oxlint-disable-next-line typescript/no-explicit-any -- the hook only reads the fields passed here
    req: { payload: { jobs: { queue }, find } } as any,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
    doc: { id: 'p1', slug: 'post', ...doc } as any,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
    previousDoc: previousDoc as any,
    context,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
  } as any)

  return queue.mock.calls.map(([args]) => args.input.steps)
}

const published = {
  title: 'Post',
  _status: 'published',
  content: text('Body'),
  meta: { description: 'Existing' },
}

describe('enqueueGenerateMeta', () => {
  it('queues the title on every save with a title', async () => {
    expect(await run({ title: 'Post', _status: 'draft' })).toEqual([['title']])
  })

  it('queues nothing without a title or publication', async () => {
    expect(await run({ title: '', _status: 'draft' })).toEqual([])
  })

  it('adds the description for a published document without one', async () => {
    expect(await run({ ...published, meta: { description: '' } }, published)).toEqual([
      ['title', 'description'],
    ])
  })

  it('adds the description when the published content changed', async () => {
    expect(await run({ ...published, content: text('New body') }, published)).toEqual([
      ['title', 'description'],
    ])
  })

  it('keeps the description when the published content is unchanged', async () => {
    expect(await run(published, published)).toEqual([['title']])
  })

  it('skips the write the meta task makes itself', async () => {
    expect(await run(published, published, { triggeredByTask: TaskSlug.GenerateMeta })).toEqual([])
  })
})
