'use client'

import type React from 'react'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshRouteOnSave as PayloadLivePreview } from '@payloadcms/live-preview-react'

import { getRuntimeConfig } from '@/lib/runtimeConfig'

export const LivePreviewListener: React.FC = () => {
  const router = useRouter()
  /**
   * Next's App Router wraps `router.refresh()` in `document.startViewTransition()`,
   * which throws `InvalidStateError` and drops the refresh outright while
   * `document.hidden` is true. The live-preview iframe can stay `hidden` even
   * while visibly on screen, so a save made while that holds never reaches the
   * frame. Re-running the last refresh once the document becomes visible again
   * closes that gap without depending on the transition succeeding the first time.
   */
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
