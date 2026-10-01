import { describe, expect, it, vi } from 'vitest'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

import { enqueueGenerateExcerpt } from './enqueueGenerateExcerpt'

const editorState = (...texts: string[]) => ({
  root: {
    type: 'root',
    version: 1,
    direction: 'ltr',
    format: '',
    indent: 0,
    children: texts.map((text) => ({
      type: 'paragraph',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: text
        ? [
            {
              type: 'text',
              version: 1,
              text,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
            },
          ]
        : [],
    })),
  },
})

const createReq = () => {
  const queue = vi.fn()
  return {
    queue,
    req: {
      payload: {
        jobs: {
          queue,
        },
      },
    },
  }
}

// oxlint-disable-next-line typescript/no-explicit-any -- the hook only reads the fields these tests pass
type HookArgs = any

const run = async (doc: Record<string, unknown>) => {
  const { queue, req } = createReq()
  await enqueueGenerateExcerpt({
    req,
    doc: {
      id: 'post-1',
      _status: 'published',
      content: editorState('Body text.'),
      ...doc,
    },
  } as HookArgs)
  return queue
}

describe('enqueueGenerateExcerpt', () => {
  it('queues the task when a post is published without an excerpt', async () => {
    const queue = await run({})

    expect(queue).toHaveBeenCalledExactlyOnceWith({
      task: TaskSlug.GenerateBlogPostExcerpt,
      input: {
        postId: 'post-1',
      },
      queue: QueueSlug.HookHandler,
    })
  })

  it('treats the empty paragraph an untouched editor stores as no excerpt', async () => {
    const queue = await run({
      excerpt: editorState(''),
    })

    expect(queue).toHaveBeenCalledOnce()
  })

  it('leaves a hand-written excerpt alone', async () => {
    const queue = await run({
      excerpt: editorState('Written by hand.'),
    })

    expect(queue).not.toHaveBeenCalled()
  })

  it('skips draft saves', async () => {
    const queue = await run({
      _status: 'draft',
    })

    expect(queue).not.toHaveBeenCalled()
  })

  it('skips trashed posts', async () => {
    const queue = await run({
      deletedAt: '2026-10-01T00:00:00.000Z',
    })

    expect(queue).not.toHaveBeenCalled()
  })

  it('skips posts without content', async () => {
    const queue = await run({
      content: editorState(''),
    })

    expect(queue).not.toHaveBeenCalled()
  })
})
