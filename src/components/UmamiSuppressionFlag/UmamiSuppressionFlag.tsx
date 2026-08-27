import type { JSX } from 'react'

import { isTrackingSuppressed } from '@/lib/umami/isTrackingSuppressed.server'

/**
 * Reads `isTrackingSuppressed()` — which itself calls `cookies()`, a runtime
 * API — away from the layout itself.
 *
 * With `cacheComponents: true` any uncached access in `RootLayout` blocks the
 * whole route from prerendering. Isolating the read here, behind its own
 * `<Suspense>` boundary, keeps the layout in the static shell while the
 * client-side `track()` path still learns, as early as possible, whether the
 * current (authenticated Payload) session should be excluded from analytics.
 *
 * Because the flag is set by this Suspense-streamed script rather than
 * inline in the initial HTML, there's a small window where a client-side
 * `track()` call (e.g. the user's very first in-app navigation) could fire
 * before the script has executed. This is an accepted, bounded gap — not a
 * hard guarantee — and `trackServerEvent`'s independent server-side
 * `isTrackingSuppressed()` check is unaffected by this timing.
 */
export const UmamiSuppressionFlag = async (): Promise<JSX.Element | null> => {
  const suppressed = await isTrackingSuppressed()

  if (!suppressed) {
    return null
  }

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: static, hardcoded script body — no user input is interpolated
      dangerouslySetInnerHTML={{
        __html: 'window.__UMAMI_SUPPRESSED__ = true;',
      }}
    />
  )
}

export default UmamiSuppressionFlag
