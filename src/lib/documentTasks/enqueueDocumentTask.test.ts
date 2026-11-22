import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'
import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

import { enqueueDocumentTask } from './enqueueDocumentTask'

const createPayload = (pendingInput?: { steps?: string[] }) => {
  const queue = vi.fn(async (_args: { input: Record<string, unknown> }) => ({ id: 'job-1' }))

  return {
    queue,
    // oxlint-disable-next-line typescript/no-explicit-any -- the helper only calls these two methods
    payload: {
      jobs: { queue },
      find: vi.fn(async () => ({ docs: pendingInput ? [{ input: pendingInput }] : [] })),
    } as any,
  }
}

const tag = { id: 'tag-1', slug: 'react' }

describe('enqueueDocumentTask', () => {
  it('queues the task with the document ref and steps', async () => {
    const { payload, queue } = createPayload()

    await enqueueDocumentTask({
      payload,
      task: TaskSlug.CalculateSkillTag,
      collection: CollectionSlug.ResumeSkillTags,
      doc: tag,
      steps: ['interval'],
    })

    expect(queue).toHaveBeenCalledExactlyOnceWith({
      task: TaskSlug.CalculateSkillTag,
      queue: QueueSlug.HookHandler,
      input: {
        collection: CollectionSlug.ResumeSkillTags,
        id: 'tag-1',
        ref: 'react',
        steps: ['interval'],
      },
    })
  })

  it('merges the steps of a still-queued job it supersedes', async () => {
    const { payload, queue } = createPayload({ steps: ['type'] })

    await enqueueDocumentTask({
      payload,
      task: TaskSlug.CalculateSkillTag,
      collection: CollectionSlug.ResumeSkillTags,
      doc: tag,
      steps: ['interval'],
    })

    expect(queue.mock.calls[0]?.[0].input.steps).toEqual(['type', 'interval'])
  })

  it('keeps every step when the queued job ran all of them', async () => {
    const { payload, queue } = createPayload({ steps: [] })

    await enqueueDocumentTask({
      payload,
      task: TaskSlug.CalculateSkillTag,
      collection: CollectionSlug.ResumeSkillTags,
      doc: tag,
      steps: ['interval'],
    })

    expect(queue.mock.calls[0]?.[0].input.steps).toEqual([])
  })

  it('sends no steps for a task without any', async () => {
    const { payload, queue } = createPayload()

    await enqueueDocumentTask({
      payload,
      task: TaskSlug.SyncReferences,
      collection: CollectionSlug.Pages,
      doc: { id: 'p1', slug: 'about' },
    })

    expect(queue.mock.calls[0]?.[0].input).toEqual({
      collection: CollectionSlug.Pages,
      id: 'p1',
      ref: 'about',
    })
    expect(payload.find).not.toHaveBeenCalled()
  })
})
