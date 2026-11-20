import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getClient } from '@/lib/RedisHandler'

import { buildRouteIndex } from './buildRouteIndex'
import {
  addRoute,
  getRouteIndex,
  hasRoute,
  rebuildRouteIndex,
  removeRoute,
} from './routeIndexStore'

vi.mock('@payload-config', () => ({
  default: {},
}))

vi.mock('@/lib/RedisHandler', () => ({
  getClient: vi.fn(),
}))

vi.mock('./buildRouteIndex', () => ({
  buildRouteIndex: vi.fn(),
}))

/** A faithful in-memory stand-in for the hash commands the store uses. */
const fakeRedis = () => {
  const hashes = new Map<string, Map<string, string>>()
  const hash = (key: string) => hashes.get(key) ?? hashes.set(key, new Map()).get(key)

  return {
    hashes,
    hGetAll: vi.fn(async (key: string) => Object.fromEntries(hashes.get(key) ?? [])),
    hmGet: vi.fn(async (key: string, fields: string[]) =>
      fields.map((field) => hashes.get(key)?.get(field) ?? null),
    ),
    hSet: vi.fn(async (key: string, values: Record<string, string>) => {
      for (const [field, value] of Object.entries(values)) hash(key).set(field, value)
    }),
    hSetNX: vi.fn(async (key: string, field: string, value: string) => {
      if (!hash(key).has(field)) hash(key).set(field, value)
    }),
    hDel: vi.fn(async (key: string, field: string) => hashes.get(key)?.delete(field)),
    rename: vi.fn(async (from: string, to: string) => {
      hashes.set(to, hash(from))
      hashes.delete(from)
    }),
  }
}

let redis: ReturnType<typeof fakeRedis>

beforeEach(() => {
  vi.clearAllMocks()
  redis = fakeRedis()
  // SAFETY: the store only uses the hash commands the fake implements.
  vi.mocked(getClient).mockResolvedValue(redis as never)
  vi.mocked(buildRouteIndex).mockResolvedValue({
    '/': { indexable: true },
    '/blog/empty': { indexable: false },
  })
})

describe('routeIndexStore', () => {
  it('builds and stores the index when Redis has none', async () => {
    await expect(hasRoute('/')).resolves.toBe(true)
    await expect(hasRoute('/missing')).resolves.toBe(false)

    expect(buildRouteIndex).toHaveBeenCalledTimes(1)
    expect([...redis.hashes.keys()]).toEqual(['route-index'])
  })

  it('answers from Redis once built', async () => {
    await rebuildRouteIndex({} as never)
    vi.mocked(buildRouteIndex).mockClear()

    await expect(hasRoute('/blog/empty')).resolves.toBe(true)
    await expect(getRouteIndex()).resolves.toEqual({
      '/': { indexable: true },
      '/blog/empty': { indexable: false },
    })
    expect(buildRouteIndex).not.toHaveBeenCalled()
  })

  it('shares one build between concurrent callers', async () => {
    await Promise.all([hasRoute('/'), hasRoute('/x'), getRouteIndex()])

    expect(buildRouteIndex).toHaveBeenCalledTimes(1)
  })

  it('applies hook edits to a built index without touching listed metadata', async () => {
    await rebuildRouteIndex({} as never)

    await addRoute('/new-page', { indexable: true })
    await addRoute('/blog/empty', { indexable: true })
    await removeRoute('/')

    await expect(getRouteIndex()).resolves.toEqual({
      '/new-page': { indexable: true },
      '/blog/empty': { indexable: false },
    })
  })

  it('treats a hash that only holds hook edits as missing and rebuilds it', async () => {
    await addRoute('/new-page', { indexable: true })

    await expect(hasRoute('/')).resolves.toBe(true)
    expect(buildRouteIndex).toHaveBeenCalledTimes(1)
  })
})
