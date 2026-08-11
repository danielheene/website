import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

/**
 *    Deterministic environment for tests. Several modules read these at call
 *    time (generateContentURL, generatePreviewPath); date tests depend on TZ.
 */
process.env.SERVER_URL ??= 'http://localhost:3000'
process.env.PREVIEW_SECRET ??= 'test-preview-secret'
process.env.ANTHROPIC_API_KEY ??= 'sk-ant-test'
process.env.TZ = 'UTC'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
  vi.useRealTimers()
  // `globals: false` means @testing-library/react's own afterEach-detection
  // auto-cleanup never registers, so jsdom component tests must do it here.
  cleanup()
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
  // Cache Components directives are no-ops outside the Next.js runtime; the
  // functions they annotate still need to run.
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
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

// `server-only`'s package.json only resolves to its no-op `empty.js` under
// Next.js's `react-server` export condition; vitest's `node` environment
// doesn't set that condition, so a bare `import 'server-only'` would throw
// "This module cannot be imported from a Client Component module" in every
// test that transitively imports a guarded module. Stub it to a no-op here.
vi.mock('server-only', () => ({}))

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
