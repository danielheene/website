import { describe, expect, it, vi } from 'vitest'

import { QueueSlug, TaskSlug } from '@/types/jobs-queue'

import {
  enqueueCalculateSkillTagType,
  enqueueCalculateSkillTagTypeAfterDelete,
} from './enqueueCalculateSkillTagType'

const tags = (...ids: string[]) =>
  ids.map((value) => ({
    relationTo: 'resume-skill-tags' as const,
    value,
  }))

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

const queuedTagIds = (queue: ReturnType<typeof vi.fn>) =>
  queue.mock.calls.map(([args]) => args.input.skillTagId).sort()

// biome-ignore lint/suspicious/noExplicitAny: hooks only read the fields these tests pass
type HookArgs = any

describe('enqueueCalculateSkillTagType', () => {
  it('queues only added and removed tags when nothing else changed', async () => {
    const { queue, req } = createReq()

    await enqueueCalculateSkillTagType({
      req,
      previousDoc: {
        _status: 'published',
        type: 'programmingLanguages',
        skillTags: tags('a', 'b'),
      },
      doc: {
        _status: 'published',
        type: 'programmingLanguages',
        skillTags: tags('b', 'c'),
      },
    } as HookArgs)

    expect(queuedTagIds(queue)).toEqual([
      'a',
      'c',
    ])
    expect(queue).toHaveBeenCalledWith({
      task: TaskSlug.CalculateSkillTagType,
      input: {
        skillTagId: 'a',
      },
      queue: QueueSlug.HookHandler,
    })
  })

  it('queues every tag when the skill type changes', async () => {
    const { queue, req } = createReq()

    await enqueueCalculateSkillTagType({
      req,
      previousDoc: {
        _status: 'published',
        type: 'programmingLanguages',
        skillTags: tags('a', 'b'),
      },
      doc: {
        _status: 'published',
        type: 'testingAndQuality',
        skillTags: tags('b'),
      },
    } as HookArgs)

    expect(queuedTagIds(queue)).toEqual([
      'a',
      'b',
    ])
  })

  it('skips unpublished draft saves', async () => {
    const { queue, req } = createReq()

    await enqueueCalculateSkillTagType({
      req,
      previousDoc: {
        _status: 'draft',
        skillTags: tags('a'),
      },
      doc: {
        _status: 'draft',
        skillTags: tags('b'),
      },
    } as HookArgs)

    expect(queue).not.toHaveBeenCalled()
  })
})

describe('enqueueCalculateSkillTagTypeAfterDelete', () => {
  it('queues every tag of a permanently deleted skill', async () => {
    const { queue, req } = createReq()

    await enqueueCalculateSkillTagTypeAfterDelete({
      req,
      doc: {
        skillTags: tags('a', 'b'),
      },
    } as HookArgs)

    expect(queuedTagIds(queue)).toEqual([
      'a',
      'b',
    ])
  })
})
