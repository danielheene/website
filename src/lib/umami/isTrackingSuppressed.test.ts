import { SignJWT } from 'jose'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const TEST_SECRET = 'test-payload-secret-1234567890'
const WRONG_SECRET = 'wrong-payload-secret-0987654321'

const mockGet = vi.fn()

vi.mock('next/headers', () => ({
  cookies: vi.fn(async () => ({
    get: mockGet,
  })),
}))

const { isTrackingSuppressed } = await import('./isTrackingSuppressed.server')

const signToken = async (
  claims: Record<string, unknown>,
  secret: string,
  expiresInSeconds = 60 * 60,
) =>
  new SignJWT(claims)
    .setProtectedHeader({
      alg: 'HS256',
      typ: 'JWT',
    })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(new TextEncoder().encode(secret))

describe('isTrackingSuppressed', () => {
  beforeEach(() => {
    vi.stubEnv('PAYLOAD_SECRET', TEST_SECRET)
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    mockGet.mockReset()
  })

  it('returns false when no payload-token cookie is present', async () => {
    mockGet.mockReturnValue(undefined)

    await expect(isTrackingSuppressed()).resolves.toBe(false)
  })

  it('returns true for a valid token with no enableOwnTracking claim at all', async () => {
    const token = await signToken(
      {
        id: 'user-1',
      },
      TEST_SECRET,
    )
    mockGet.mockReturnValue({
      value: token,
    })

    await expect(isTrackingSuppressed()).resolves.toBe(true)
  })

  it('returns true for a valid token with enableOwnTracking: false', async () => {
    const token = await signToken(
      {
        id: 'user-1',
        enableOwnTracking: false,
      },
      TEST_SECRET,
    )
    mockGet.mockReturnValue({
      value: token,
    })

    await expect(isTrackingSuppressed()).resolves.toBe(true)
  })

  it('returns false for a valid token with enableOwnTracking: true', async () => {
    const token = await signToken(
      {
        id: 'user-1',
        enableOwnTracking: true,
      },
      TEST_SECRET,
    )
    mockGet.mockReturnValue({
      value: token,
    })

    await expect(isTrackingSuppressed()).resolves.toBe(false)
  })

  it('returns false for a token signed with the wrong secret', async () => {
    const token = await signToken(
      {
        id: 'user-1',
      },
      WRONG_SECRET,
    )
    mockGet.mockReturnValue({
      value: token,
    })

    await expect(isTrackingSuppressed()).resolves.toBe(false)
  })

  it('returns false for an expired token', async () => {
    const token = await signToken(
      {
        id: 'user-1',
      },
      TEST_SECRET,
      -60,
    )
    mockGet.mockReturnValue({
      value: token,
    })

    await expect(isTrackingSuppressed()).resolves.toBe(false)
  })

  it('returns false for a malformed/garbage cookie value without throwing', async () => {
    mockGet.mockReturnValue({
      value: 'not-a-jwt-at-all',
    })

    await expect(isTrackingSuppressed()).resolves.toBe(false)
  })
})
