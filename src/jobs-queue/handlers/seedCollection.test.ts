import { describe, expect, it, vi } from 'vitest'

const publishMock = vi.fn()
const seedPagesMock = vi.fn()
const cleanPagesMock = vi.fn()

vi.mock('@/lib/RedisHandler', () => ({
  publish: (...args: unknown[]) => publishMock(...args),
}))

vi.mock('@/lib/seed/pages', () => ({
  seedPages: (...args: unknown[]) => seedPagesMock(...args),
  cleanPages: (...args: unknown[]) => cleanPagesMock(...args),
}))

vi.mock('@/lib/seed/posts', () => ({
  seedPosts: vi.fn(),
  cleanPosts: vi.fn(),
}))

vi.mock('@/lib/seed/topics', () => ({
  seedTopics: vi.fn(),
  cleanTopics: vi.fn(),
}))

const { handler: seedCollection } = await import('./seedCollection')

// oxlint-disable-next-line typescript/no-explicit-any -- the mocked args are a subset of TaskHandlerArgs
const handler = seedCollection as (args: any) => Promise<any>

const makeArgs = (input: { collection: string; mode: string; count?: number }) => ({
  job: { id: 'job-1' },
  input,
  req: {
    payload: {
      logger: { info: vi.fn(), error: vi.fn() },
    },
    // oxlint-disable-next-line typescript/no-explicit-any -- mocked subset of Payload's req
  } as any,
})

describe('seedCollection', () => {
  it('seeds the chosen collection in seed mode', async () => {
    seedPagesMock.mockResolvedValue({ created: 3 })

    const result = await handler(makeArgs({ collection: 'pages', mode: 'seed', count: 3 }))

    expect(seedPagesMock).toHaveBeenCalled()
    expect(cleanPagesMock).not.toHaveBeenCalled()
    expect(result).toEqual({ output: {} })
  })

  it('cleans the chosen collection in clean mode', async () => {
    cleanPagesMock.mockResolvedValue({ deleted: 1, deletedMedia: 1 })

    await handler(makeArgs({ collection: 'pages', mode: 'clean' }))

    expect(cleanPagesMock).toHaveBeenCalled()
    expect(seedPagesMock).not.toHaveBeenCalled()
  })

  it('rejects an unknown mode instead of silently cleaning', async () => {
    await expect(
      handler(makeArgs({ collection: 'pages', mode: 'destroy-everything' })),
    ).rejects.toThrow('Unknown seed mode')

    expect(seedPagesMock).not.toHaveBeenCalled()
    expect(cleanPagesMock).not.toHaveBeenCalled()
  })
})
