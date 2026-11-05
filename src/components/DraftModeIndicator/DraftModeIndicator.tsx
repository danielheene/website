import type { JSX } from 'react'
import { draftMode, headers } from 'next/headers'

import { Icon } from '@/components/Icon'

/**
 * Reads `draftMode()` away from the layout itself.
 */
export const DraftModeIndicator = async (): Promise<JSX.Element | null> => {
  const { isEnabled: draft } = await draftMode()

  if (!draft) return null

  const headersList = await headers()
  const currentPath = headersList.get('X-Current-Path') || '/'
  const exitPath = `/api/preview?action=disable&path=${encodeURIComponent(currentPath)}`

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-center gap-3 bg-warning-700 px-4 py-2 font-mono text-sm font-medium text-white">
      <Icon name="material-symbols:visibility" className="text-base" />
      <span>Draft mode is on — you’re viewing unpublished content.</span>
      <a
        href={exitPath}
        className="inline-flex items-center gap-1 underline underline-offset-2 hover:no-underline"
      >
        <Icon name="close" className="text-base" />
        Exit preview
      </a>
    </div>
  )
}

export default DraftModeIndicator
