import { getPayload } from 'payload'

import { describe, expect, it, vi } from 'vitest'

import { CollectionSlug } from '@/types/collections'

vi.mock('@payload-config', () => ({
  default: {},
}))

const { fetchResumeJobs } = await import('./fetchResumeJobs')

describe('fetchResumeJobs', () => {
  it('returns the latest position first', async () => {
    const findMock = vi.fn(async () => ({
      docs: [],
    }))
    vi.mocked(getPayload).mockResolvedValueOnce({
      find: findMock,
    } as unknown as Awaited<ReturnType<typeof getPayload>>)

    await fetchResumeJobs('en')

    expect(findMock).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: CollectionSlug.ResumeJobs,
        sort: '-startDate',
      }),
    )
  })
})
