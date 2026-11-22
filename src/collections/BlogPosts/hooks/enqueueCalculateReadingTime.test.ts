import { describe, expect, it, vi } from 'vitest'

import { TaskSlug } from '@/types/jobs-queue'

import { enqueueCalculateReadingTime } from './enqueueCalculateReadingTime'

const text = (value: string) => ({
  root: { children: [{ type: 'paragraph', children: [{ type: 'text', text: value }] }] },
})

const published = {
  id: 'post-1',
  slug: 'post',
  _status: 'published',
  content: text('Body text.'),
  readingTime: 1,
}

const run = async (
  doc: Record<string, unknown>,
  previousDoc: Record<string, unknown> = published,
  context: Record<string, unknown> = {},
) => {
  const queue = vi.fn()

  await enqueueCalculateReadingTime({
    // oxlint-disable-next-line typescript/no-explicit-any -- the hook only reads the fields passed here
    req: { payload: { jobs: { queue } } } as any,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
    doc: { ...published, ...doc } as any,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
    previousDoc: previousDoc as any,
    context,
    // oxlint-disable-next-line typescript/no-explicit-any -- as above
  } as any)

  return queue
}

describe('enqueueCalculateReadingTime', () => {
  it('queues a published post without a reading time', async () => {
    expect(await run({ readingTime: null })).toHaveBeenCalledOnce()
  })

  it('queues a published post whose content text changed', async () => {
    expect(await run({ content: text('A longer body text.') })).toHaveBeenCalledOnce()
  })

  it('skips a published post with an unchanged content', async () => {
    expect(await run({})).not.toHaveBeenCalled()
  })

  it('skips drafts', async () => {
    expect(await run({ _status: 'draft', readingTime: null })).not.toHaveBeenCalled()
  })

  it('skips the write the task makes itself', async () => {
    expect(
      await run({ readingTime: null }, published, {
        triggeredByTask: TaskSlug.CalculateReadingTime,
      }),
    ).not.toHaveBeenCalled()
  })
})
