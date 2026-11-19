import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Bearer token for `/api/revalidate`, derived from `PAYLOAD_SECRET` so the
 * worker and the app share it without a separate secret to provision.
 */
export const createRevalidateToken = (): string => {
  const secret = process.env.PAYLOAD_SECRET

  if (!secret) throw new Error('PAYLOAD_SECRET is not set')

  return createHmac('sha256', secret).update('revalidate-cache').digest('hex')
}

// `timingSafeEqual` throws on buffers of different length, hence the length check.
export const isValidRevalidateToken = (candidate: string | null | undefined): boolean => {
  if (!candidate || !process.env.PAYLOAD_SECRET) return false

  const expected = Buffer.from(createRevalidateToken())
  const supplied = Buffer.from(candidate)

  if (expected.length !== supplied.length) return false

  return timingSafeEqual(expected, supplied)
}
