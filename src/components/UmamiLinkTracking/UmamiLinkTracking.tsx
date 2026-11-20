'use client'

import { useEffect } from 'react'

import { classifyLinkClick } from '@/lib/umami/events'
import { track } from '@/lib/umami/track'

const onLinkClick = (event: MouseEvent) => {
  // primary and middle clicks open links; the right button only opens a menu
  if (event.button > 1 || !(event.target instanceof Element)) return

  const anchor = event.target.closest('a[href]')

  // download buttons send their own, more specific events
  if (!anchor || anchor.hasAttribute('download')) return

  const linkEvent = classifyLinkClick(anchor.getAttribute('href') ?? '', location.origin)

  if (linkEvent) track(linkEvent.name, linkEvent.data)
}

/**
 * Tracks contact, outbound, feed and file links site-wide with one delegated
 * listener, so links rendered from rich text and settings need no handlers.
 */
export const UmamiLinkTracking = () => {
  useEffect(() => {
    document.addEventListener('click', onLinkClick, { capture: true })
    document.addEventListener('auxclick', onLinkClick, { capture: true })

    return () => {
      document.removeEventListener('click', onLinkClick, { capture: true })
      document.removeEventListener('auxclick', onLinkClick, { capture: true })
    }
  }, [])

  return null
}
