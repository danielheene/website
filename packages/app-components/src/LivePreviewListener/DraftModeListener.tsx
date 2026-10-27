import type { JSX } from 'react'
import { draftMode } from 'next/headers'

import { LivePreviewListener } from './LivePreviewListener'

/**
 * Reads `draftMode()` — a runtime API — away from the layout itself.
 *
 * With `cacheComponents: true` any uncached access in `RootLayout` blocks the
 * whole route from prerendering. Isolating the read here, behind its own
 * `<Suspense>` boundary, keeps the layout in the static shell while live
 * preview still works in draft.
 */
export const DraftModeListener = async (): Promise<JSX.Element | null> => {
  const { isEnabled } = await draftMode()

  return isEnabled ? <LivePreviewListener /> : null
}

export default DraftModeListener
