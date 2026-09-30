import type { Payload } from 'payload'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  cleanResumeDocuments,
  SEEDED_RESUME_DOCUMENTS,
  seedResumeDocuments,
} from './resumeDocuments'

const find = vi.fn()
const create = vi.fn()
const deleteFn = vi.fn()

const makePayload = (): Payload =>
  ({
    find,
    create,
    delete: deleteFn,
  }) as unknown as Payload

beforeEach(() => {
  find.mockReset()
  create.mockReset()
  deleteFn.mockReset()
})

describe('seedResumeDocuments', () => {
  it('creates an older and a newer document, tagged seeded-dummy', async () => {
    find.mockResolvedValue({
      docs: [],
    })
    const now = new Date('2026-09-30T12:00:00.000Z')

    const result = await seedResumeDocuments(makePayload(), undefined, now)

    expect(result.created).toBe(SEEDED_RESUME_DOCUMENTS.length)
    const [older, newer] = create.mock.calls.map(([{ data }]) => data)
    expect(older.generatorFlags).toEqual([
      'seeded-dummy',
    ])
    expect(newer.createdAt).toBe(now.toISOString())
    expect(new Date(older.createdAt).getTime()).toBeLessThan(now.getTime())
  })

  it('skips a slug that already exists instead of creating a duplicate', async () => {
    find.mockResolvedValue({
      docs: [
        {
          id: 'existing',
        },
      ],
    })

    const result = await seedResumeDocuments(makePayload())

    expect(result.created).toBe(0)
    expect(create).not.toHaveBeenCalled()
  })
})

describe('cleanResumeDocuments', () => {
  it('deletes every seeded document', async () => {
    find.mockResolvedValue({
      docs: [
        {
          id: 'a',
          slug: 'seeded-dummy-resume-older',
        },
        {
          id: 'b',
          slug: 'seeded-dummy-resume-newer',
        },
      ],
    })

    const result = await cleanResumeDocuments(makePayload())

    expect(result.deleted).toBe(2)
    expect(deleteFn).toHaveBeenCalledTimes(2)
  })
})
