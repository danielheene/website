'use server'

/**
 * Whether Unsplash search/import can run. The admin UI uses this to decide
 * whether to show a working search box or a "not configured" message,
 * without ever exposing the key value itself to the client.
 */
export const isUnsplashConfigured = async (): Promise<boolean> =>
  Boolean(process.env.UNSPLASH_ACCESS_KEY)
