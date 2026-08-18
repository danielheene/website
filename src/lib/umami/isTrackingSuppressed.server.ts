'use server'

import { cookies } from 'next/headers'

import { jwtVerify } from 'jose'

const PAYLOAD_TOKEN_COOKIE = 'payload-token'

const getSecretKey = () => new TextEncoder().encode(process.env.PAYLOAD_SECRET)

/**
 * Determines whether server-side Umami tracking should be suppressed for
 * the current request, based on the site owner's Payload session.
 *
 * Suppresses (returns `true`) whenever a valid `payload-token` JWT is
 * present and its `enableOwnTracking` claim is not explicitly `true` — this
 * keeps the site owner's own authenticated browsing out of analytics by
 * default. Anonymous visitors (no cookie) and sessions with an invalid or
 * expired token are never suppressed, since they're indistinguishable from
 * a genuine visitor. Verifies the JWT signature directly via `jose` rather
 * than calling `payload.auth()`, avoiding a database roundtrip on every
 * tracking call.
 *
 * Never throws — any failure (missing cookie, bad signature, expired
 * token, malformed value, missing env var) resolves to `false` so tracking
 * fails open rather than breaking the calling Server Component/Action.
 */
export async function isTrackingSuppressed(): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(PAYLOAD_TOKEN_COOKIE)?.value

    if (!token) {
      return false
    }

    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [
        'HS256',
      ],
    })

    const enableOwnTracking = payload.enableOwnTracking

    if (typeof enableOwnTracking === 'boolean' && enableOwnTracking === true) {
      return false
    }

    return true
  } catch {
    return false
  }
}
