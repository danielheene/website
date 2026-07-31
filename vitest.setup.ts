import { afterEach, vi } from 'vitest'

/**
 *    Deterministic environment for tests. Several modules read these at call
 *    time (generateContentURL, generatePreviewPath); date tests depend on TZ.
 */
process.env.SERVER_URL ??= 'http://localhost:3000'
process.env.PREVIEW_SECRET ??= 'test-preview-secret'
process.env.TZ = 'UTC'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
})

/**
 *    Shared mocks for external dependencies.
 *
 *    `payload` is spread from the original module on purpose: several modules
 *    import runtime values from it (via @/types/collections), so a bare
 *    factory would break them. Only `getPayload` is stubbed.
 *
 *    Intentionally NOT mocked: tailwind-merge, date-fns, slugify, pupa,
 *    neotraverse — their real behavior is the contract under test.
 */
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
  unstable_cache: (fn: unknown) => fn,
}))

vi.mock('payload', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  getPayload: vi.fn(async () => ({
    find: vi.fn(async () => ({
      docs: [],
      totalDocs: 0,
    })),
    findByID: vi.fn(async () => null),
    findGlobal: vi.fn(async () => ({})),
    create: vi.fn(async () => ({})),
    update: vi.fn(async () => ({})),
    auth: vi.fn(async () => ({
      user: null,
    })),
  })),
}))

vi.mock('redis', () => ({
  createClient: vi.fn(() => ({
    connect: vi.fn(),
    get: vi.fn(),
    set: vi.fn(),
    publish: vi.fn(),
    subscribe: vi.fn(),
    quit: vi.fn(),
    on: vi.fn(),
  })),
}))
