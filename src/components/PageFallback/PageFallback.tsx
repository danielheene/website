import type { JSX } from 'react'

/**
 * Suspense fallback for a whole page. Next.js scrolls a navigation to the new
 * page's first rendered element; with an empty fallback there is none, so the
 * scroll is skipped and the reader lands at the previous page's offset.
 */
export const PageFallback = (): JSX.Element => <div aria-hidden className="min-h-screen" />
