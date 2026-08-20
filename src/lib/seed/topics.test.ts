import type { Payload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { cleanTopics, seedTopics } from './topics'

const find = vi.fn()
const create = vi.fn()
const deleteFn = vi.fn()

const makePayload = (): Payload =>
  ({
    find,
    create,
    delete: deleteFn,
    logger: {
      info: vi.fn(),
      error: vi.fn(),
    },
  }) as unknown as Payload

beforeEach(() => {
  find.mockReset()
  create.mockReset()
  deleteFn.mockReset()
})

describe('seedTopics', () => {
  it('creates the requested number of topics, tagged seeded-dummy', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockImplementation(async ({ data }) => {
      expect(data.generatorFlags).toEqual([
        'seeded-dummy',
      ])
      return {
        id: 'topic-1',
      }
    })

    const result = await seedTopics(makePayload(), 3)

    expect(result.created).toBe(3)
    expect(create).toHaveBeenCalledTimes(3)
  })

  it('skips a slug that already exists instead of creating a duplicate', async () => {
    find.mockImplementation(async ({ where }) => {
      if (where?.slug?.equals) {
        return {
          docs: [
            {
              id: 'existing',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await seedTopics(makePayload(), 2)

    expect(result.created).toBe(0)
    expect(create).not.toHaveBeenCalled()
  })

  it('returns the created (or existing) topic ids alongside the count', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    create.mockResolvedValueOnce({
      id: 'topic-a',
    })
    create.mockResolvedValueOnce({
      id: 'topic-b',
    })

    const result = await seedTopics(makePayload(), 2)

    expect(result.created).toBe(2)
  })
})

describe('cleanTopics', () => {
  it('deletes a seeded topic that no non-seeded post references', async () => {
    find.mockImplementation(async ({ collection }) => {
      if (collection === 'topics') {
        return {
          docs: [
            {
              id: 'topic-1',
              slug: 'seeded-dummy-topic-typescript',
            },
          ],
        }
      }
      if (collection === 'posts') {
        // no post references this topic
        return {
          totalDocs: 0,
          docs: [],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanTopics(makePayload())

    expect(result.deleted).toBe(1)
    expect(result.skipped).toBe(0)
    expect(deleteFn).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: 'topics',
        id: 'topic-1',
      }),
    )
  })

  it('skips deleting a seeded topic that a non-seeded post still references', async () => {
    find.mockImplementation(async ({ collection, where }) => {
      if (collection === 'topics') {
        return {
          docs: [
            {
              id: 'topic-1',
              slug: 'seeded-dummy-topic-typescript',
            },
          ],
        }
      }
      if (collection === 'posts') {
        // Simulates a real, hand-authored post that references this
        // seeded topic — the topic must survive Clean.
        expect(where?.topics?.contains).toBe('topic-1')
        return {
          totalDocs: 1,
          docs: [
            {
              id: 'real-post',
            },
          ],
        }
      }
      return {
        docs: [],
      }
    })

    const result = await cleanTopics(makePayload())

    expect(result.deleted).toBe(0)
    expect(result.skipped).toBe(1)
    expect(deleteFn).not.toHaveBeenCalled()
  })
})
