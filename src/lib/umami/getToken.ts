// Deliberately not a 'use server' module: an export here would be a client-callable
// endpoint, and getToken hands out the Umami bearer token.

let token: string | null = null
let tokenPromise: Promise<string | null> | null = null

const login = async (): Promise<string | null> => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/login`, {
      method: 'POST',
      body: JSON.stringify({
        username: process.env.UMAMI_USERNAME,
        password: process.env.UMAMI_PASSWORD,
      }),
    })

    const data = await response.json()
    token = (data.token as string) ?? null
  } catch {
    token = null
  }

  return token
}

const verify = async (): Promise<boolean> => {
  if (!token) return false

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_UMAMI_URL}/api/auth/verify`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    return response.ok
  } catch {
    return false
  }
}

/**
 * Returns a valid bearer token, verifying the current one first and logging
 * in again if it's missing/invalid. The in-flight promise is shared while
 * pending, so concurrent callers dedupe into a single verify/login flow, but
 * it's cleared once settled so the next call re-checks instead of being
 * stuck on the first result forever.
 */
export const getToken = async (): Promise<string | null> => {
  if (tokenPromise) return tokenPromise

  tokenPromise = (async () => {
    const verified = await verify()

    if (!verified) {
      await login()
    }

    return token
  })()

  try {
    return await tokenPromise
  } finally {
    tokenPromise = null
  }
}
