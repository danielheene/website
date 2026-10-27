import { getPayload } from 'payload'

import { CollectionSlug } from '@website/types/collections'
import { describe, expect, it, vi } from 'vitest'

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
