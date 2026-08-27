/**
 * Base URL of the self-hosted Iconify API.
 *
 * Kept out of `Icon.tsx` on purpose: that module is `'use client'`, so anything
 * exported from it becomes a client reference when imported on the server — a
 * server-side `fetch` would receive a stub function rather than this string.
 * The cached `/api/icons/collection` route imports it from here.
 *
 * Written as a full `process.env.NEXT_PUBLIC_*` member expression rather than
 * destructured or dynamically indexed: the bundler inlines public env vars by
 * matching that exact form, so anything cleverer resolves to `undefined` in the
 * browser. The fallback keeps the previous hard-coded origin working when the
 * variable is unset.
 */
export const ICONIFY_API = process.env.NEXT_PUBLIC_ICONIFY_API || 'https://icons.heene.io'
