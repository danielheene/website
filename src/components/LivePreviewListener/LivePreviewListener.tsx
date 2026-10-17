'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'

import { getRuntimeConfig } from '@/lib/runtimeConfig'

/**
 * Defer live-preview refreshes while the document is hidden
 *
 * Next wraps `router.refresh()` in `document.startViewTransition()`, which
 * throws `InvalidStateError` while `document.hidden` is true. The live-preview
 * iframe can stay `hidden` even while visibly on screen, so a save made while
 * that holds would otherwise never reach the frame; `refresh()` marks it
 * pending instead, and the effect replays it on the next
 * `visibilitychange`/`focus`.
 */
export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  const pendingRefresh = useRef(false)

  useEffect(() => {
    const onVisible = () => {
      if (pendingRefresh.current && !document.hidden) {
        pendingRefresh.current = false
        router.refresh()
      }
    }

    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', onVisible)

    return () => {
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', onVisible)
    }
  }, [router])

  const refresh = () => {
    if (document.hidden) {
      pendingRefresh.current = true

      return
    }

    router.refresh()
  }

  return <PayloadLivePreview refresh={refresh} serverURL={getRuntimeConfig().serverUrl} />
}
