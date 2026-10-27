/**
 * Base URL of the self-hosted Iconify API.
 *
 * Kept out of `Icon.tsx` on purpose: that module is `'use client'`, so anything
 * exported from it becomes a client reference when imported on the server — a
 * server-side `fetch` would receive a stub function rather than this string.
 */
export const ICONIFY_API = process.env.NEXT_PUBLIC_ICONIFY_API || 'https://icons.heene.io'
