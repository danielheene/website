/**
 * Base URL of the self-hosted Iconify API.
 *
 * Kept out of `Icon.tsx` on purpose: that module is `'use client'`, so anything
 * exported from it becomes a client reference when imported on the server — a
 * server-side `fetch` would receive a stub function rather than this string.
 * The cached `/api/icons/collection` route imports it from here.
 *
 * Read through the runtime config rather than a static
 * `process.env.NEXT_PUBLIC_*` reference, which the bundler would inline at
 * compile time. The fallback is the production origin, so the browser still
 * works if the config script has not run yet.
 */
import { getRuntimeConfig } from '@/lib/runtimeConfig'

export const ICONIFY_API = getRuntimeConfig().iconifyApi || 'https://icons.heene.io'
